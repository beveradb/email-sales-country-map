import { Router } from 'itty-router'
import { serialize as serializeCookie, parse as parseCookie } from 'cookie'

interface Env {
	SESSIONS: KVNamespace
	SALES_CACHE: KVNamespace
}

const router = Router()

function json(data: unknown, init: number | ResponseInit = 200): Response {
	const status = typeof init === 'number' ? init : (init as ResponseInit).status ?? 200
	const headers: HeadersInit = { 'content-type': 'application/json; charset=utf-8', ...(typeof init === 'number' ? {} : (init as ResponseInit).headers) }
	return new Response(JSON.stringify(data), { status, headers })
}

const GOOGLE_OAUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'
const GMAIL_LIST_ENDPOINT = 'https://gmail.googleapis.com/gmail/v1/users/me/messages'
const GMAIL_GET_ENDPOINT = (id: string) => `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`

function getRedirectUri(request: Request): string {
	const url = new URL(request.url)
	const base = `${url.protocol}//${url.host}`
	return `${base}/api/auth/callback`
}

router.get('/api/health', async (request: Request, env: Env) => {
	const session = await getSession(request, env)
	return json({ ok: true, authenticated: !!session })
})

router.get('/api/auth/logout', async (request: Request, env: Env) => {
	const cookieHeader = request.headers.get('cookie') || ''
	const cookies = parseCookie(cookieHeader)
	const sid = cookies['sid']
	
	if (sid) {
		await env.SESSIONS.delete(`session:${sid}`)
	}
	
	const cookie = serializeCookie('sid', '', { httpOnly: true, sameSite: 'Lax', secure: true, path: '/', maxAge: 0 })
	return new Response(null, { status: 302, headers: { location: '/login', 'set-cookie': cookie } })
})

router.get('/api/auth/login', (request: Request, env: Env) => {
	const clientId = (env as unknown as Record<string, string>).GOOGLE_CLIENT_ID
	if (!clientId) return json({ error: 'server not configured' }, 500)
	
	const params = new URLSearchParams({
		client_id: clientId,
		redirect_uri: getRedirectUri(request),
		response_type: 'code',
		scope: 'openid email https://www.googleapis.com/auth/gmail.readonly',
		access_type: 'offline',
		prompt: 'consent',
	})
	return Response.redirect(`${GOOGLE_OAUTH_ENDPOINT}?${params.toString()}`, 302)
})

router.get('/api/auth/callback', async (request: Request, env: Env) => {
	const url = new URL(request.url)
	const code = url.searchParams.get('code')
	if (!code) return json({ error: 'missing code' }, 400)

	const redirectUri = getRedirectUri(request)
	const clientId = (env as unknown as Record<string, string>).GOOGLE_CLIENT_ID
	const clientSecret = (env as unknown as Record<string, string>).GOOGLE_CLIENT_SECRET
	if (!clientId || !clientSecret) return json({ error: 'server not configured' }, 500)

	const tokenRes = await fetch(GOOGLE_TOKEN_ENDPOINT, {
		method: 'POST',
		headers: { 'content-type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			code,
			client_id: clientId,
			client_secret: clientSecret,
			redirect_uri: redirectUri,
			grant_type: 'authorization_code',
		}).toString(),
	})
	if (!tokenRes.ok) return json({ error: 'token exchange failed' }, 500)
	const tokenJson = await tokenRes.json() as any
	const accessToken = tokenJson.access_token as string
	const refreshToken = tokenJson.refresh_token as string | undefined

	const sessionId = crypto.randomUUID()
	const sessionData = { accessToken, refreshToken, createdAt: Date.now() }
	await env.SESSIONS.put(`session:${sessionId}`, JSON.stringify(sessionData), { expirationTtl: 60 * 60 * 24 * 7 })

	const cookie = serializeCookie('sid', sessionId, { httpOnly: true, sameSite: 'Lax', secure: true, path: '/', maxAge: 60 * 60 * 24 * 7 })
	return new Response(null, { status: 302, headers: { location: '/', 'set-cookie': cookie } })
})

async function getSession(request: Request, env: Env) {
	const cookieHeader = request.headers.get('cookie') || ''
	const cookies = parseCookie(cookieHeader)
	const sid = cookies['sid']
	if (!sid) return null
	const raw = await env.SESSIONS.get(`session:${sid}`)
	if (!raw) return null
	try { return JSON.parse(raw) } catch { return null }
}

async function ensureAccessToken(env: Env, session: any): Promise<string | null> {
	if (!session) return null
	if (session.accessToken) return session.accessToken
	if (!session.refreshToken) return null
	const clientId = (env as unknown as Record<string, string>).GOOGLE_CLIENT_ID
	const clientSecret = (env as unknown as Record<string, string>).GOOGLE_CLIENT_SECRET
	const res = await fetch(GOOGLE_TOKEN_ENDPOINT, {
		method: 'POST',
		headers: { 'content-type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			client_id: clientId,
			client_secret: clientSecret,
			refresh_token: session.refreshToken,
			grant_type: 'refresh_token',
		}).toString(),
	})
	if (!res.ok) return null
	const json = await res.json() as any
	return json.access_token as string
}

router.get('/api/sales-data', async (request: Request, env: Env) => {
	const session = await getSession(request, env)
	const accessToken = await ensureAccessToken(env, session)
	if (!accessToken) return json({ error: 'unauthorized' }, 401)

	const cacheKey = `sales:${session.createdAt}` // simple per-session cache key; can include user id later
	const cached = await env.SALES_CACHE.get(cacheKey)
	if (cached) return new Response(cached, { headers: { 'content-type': 'application/json; charset=utf-8' } })

	let nextPageToken: string | undefined
	const messageIds: string[] = []
	const query = `from:clips4sale subject:"You've made a sale"`
	while (true) {
		const listUrl = new URL(GMAIL_LIST_ENDPOINT)
		listUrl.searchParams.set('q', query)
		listUrl.searchParams.set('maxResults', '100')
		if (nextPageToken) listUrl.searchParams.set('pageToken', nextPageToken)
		const res = await fetch(listUrl, { headers: { authorization: `Bearer ${accessToken}` } })
		if (!res.ok) break
		const json = await res.json() as any
		if (Array.isArray(json.messages)) {
			for (const m of json.messages) messageIds.push(m.id)
		}
		nextPageToken = json.nextPageToken
		if (!nextPageToken) break
	}

	const counts: Record<string, number> = {}
	const chunkSize = 25 // Workers have concurrency limits; small chunk size
	for (let i = 0; i < messageIds.length; i += chunkSize) {
		const chunk = messageIds.slice(i, i + chunkSize)
		const results = await Promise.all(chunk.map(async (id) => {
			const res = await fetch(GMAIL_GET_ENDPOINT(id), { headers: { authorization: `Bearer ${accessToken}` } })
			if (!res.ok) return null
			return res.json() as Promise<any>
		}))
		for (const msg of results) {
			if (!msg) continue
			const bodyParts: string[] = []
			function collect(p: any) {
				if (!p) return
				if (p.mimeType === 'text/plain' && p.body?.data) {
					try { bodyParts.push(atob(p.body.data.replace(/-/g,'+').replace(/_/g,'/'))) } catch {}
				}
				if (Array.isArray(p.parts)) p.parts.forEach(collect)
			}
			collect(msg.payload)
			const text = bodyParts.join('\n')
			const match = text.match(/Country from IP:\s*(.+)/i)
			if (match) {
				const country = match[1].trim()
				counts[country] = (counts[country] || 0) + 1
			}
		}
	}

	const body = JSON.stringify(counts)
	await env.SALES_CACHE.put(cacheKey, body, { expirationTtl: 3600 })
	return new Response(body, { headers: { 'content-type': 'application/json; charset=utf-8' } })
})

// Fallback for non-API routes - redirect to Pages
router.all('*', (request: Request) => {
  const url = new URL(request.url)
  // If it's not an API route, this shouldn't be handled by the worker
  if (!url.pathname.startsWith('/api/')) {
    // Return a response that lets Cloudflare fall through to Pages
    return new Response(null, { status: 404 })
  }
  return new Response('API endpoint not found', { status: 404 })
})

export default {
	fetch: (request: Request, env: Env) => router.handle(request, env),
}
