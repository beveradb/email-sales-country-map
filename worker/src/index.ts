import { Router } from 'itty-router'
import { serialize as serializeCookie, parse as parseCookie } from 'cookie'

interface Env {
	SESSIONS: KVNamespace
	SALES_CACHE: KVNamespace
}

interface EmailTemplate {
	id: string
	name: string
	description: string
	subjectQuery: string
	countryRegex: string
	exampleEmail?: {
		subject: string
		bodySnippet: string
		countryMatch: string
	}
	instructions?: string
}

// Default template (Clips4Sale) if none provided
const DEFAULT_TEMPLATE: EmailTemplate = {
	id: 'clips4sale',
	name: 'Clips4Sale',
	description: 'Sales notification emails from Clips4Sale platform',
	subjectQuery: 'subject:"You\'ve Made a Sale!" OR subject:"Fwd: You\'ve Made a Sale!"',
	countryRegex: 'Country from IP:\\s*(?:<[^>]*>)?\\s*([^<\\n\\r]+)'
}

const router = Router()

function json(data: unknown, init: number | ResponseInit = 200): Response {
	const status = typeof init === 'number' ? init : (init as ResponseInit).status ?? 200
	const headers: HeadersInit = { 'content-type': 'application/json; charset=utf-8', ...(typeof init === 'number' ? {} : (init as ResponseInit).headers) }
	return new Response(JSON.stringify(data), { status, headers })
}

function getTemplateFromRequest(request: Request): EmailTemplate {
	const url = new URL(request.url)
	const templateParam = url.searchParams.get('template')
	
	if (templateParam) {
		try {
			const parsed = JSON.parse(templateParam) as EmailTemplate
			// Validate that required fields exist
			if (parsed.subjectQuery && parsed.countryRegex) {
				return parsed
			}
		} catch (e) {
			console.warn('Failed to parse template parameter:', e)
		}
	}
	
	return DEFAULT_TEMPLATE
}

const GOOGLE_OAUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'
const GMAIL_LIST_ENDPOINT = 'https://gmail.googleapis.com/gmail/v1/users/me/messages'
const GMAIL_GET_ENDPOINT = (id: string) => `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`

function getRedirectUri(request: Request): string {
	const url = new URL(request.url)
	
	// For local development, force localhost:8787
	if (url.host === 'localhost:8787') {
		return 'http://localhost:8787/api/auth/callback'
	}
	
	const base = `${url.protocol}//${url.host}`
	return `${base}/api/auth/callback`
}

router.get('/api/health', async (request: Request, env: Env) => {
	const session = await getSession(request, env)
	return json({ ok: true, authenticated: !!session })
})

// Diagnostic endpoint for JavaScript loading issues
router.post('/api/diagnostics', async (request: Request, env: Env) => {
	try {
		const diagnostics = await request.json() as {
			userAgent: string
			loadTime: number
			errors: Array<{
				type: string
				message?: string
				filename?: string
				reason?: string
				timestamp: number
			}>
			rootChildren: number
			jsEnabled: boolean
			timestamp: string
			url: string
			referrer: string
		}
		
		// Log diagnostic data for debugging
		console.log('🔍 Frontend Diagnostic Report:', {
			userAgent: diagnostics.userAgent,
			loadTime: diagnostics.loadTime,
			errorCount: diagnostics.errors.length,
			errors: diagnostics.errors,
			url: diagnostics.url,
			timestamp: diagnostics.timestamp
		})
		
		// Store diagnostic data in KV for analysis (optional, expires after 24 hours)
		try {
			const diagnosticKey = `diagnostic:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`
			await env.SALES_CACHE.put(diagnosticKey, JSON.stringify(diagnostics), { expirationTtl: 86400 })
		} catch (kvError) {
			console.warn('Could not store diagnostic data in KV:', kvError)
		}
		
		return json({ received: true, timestamp: new Date().toISOString() })
	} catch (error) {
		console.error('Error processing diagnostic data:', error)
		return json({ error: 'Failed to process diagnostic data' }, 400)
	}
})

// Diagnostic retrieval endpoint for debugging (admin only)
router.get('/api/diagnostics', async (request: Request, env: Env) => {
	try {
		// List recent diagnostic reports
		const diagnosticKeys: string[] = []
		const listResult = await env.SALES_CACHE.list({ prefix: 'diagnostic:' })
		
		const reports = await Promise.all(
			listResult.keys.slice(0, 20).map(async (key) => {
				try {
					const data = await env.SALES_CACHE.get(key.name)
					return data ? JSON.parse(data) : null
				} catch (e) {
					return null
				}
			})
		)
		
		const validReports = reports.filter(Boolean)
		
		return json({ 
			count: validReports.length,
			reports: validReports,
			summary: {
				totalErrors: validReports.reduce((sum, r) => sum + r.errors.length, 0),
				avgLoadTime: validReports.length > 0 ? validReports.reduce((sum, r) => sum + r.loadTime, 0) / validReports.length : 0,
				commonErrors: getCommonErrors(validReports)
			}
		})
	} catch (error) {
		console.error('Error retrieving diagnostic data:', error)
		return json({ error: 'Failed to retrieve diagnostic data' }, 500)
	}
})

function getCommonErrors(reports: any[]): Record<string, number> {
	const errorCounts: Record<string, number> = {}
	reports.forEach(report => {
		report.errors.forEach((error: any) => {
			const key = error.type || 'unknown'
			errorCounts[key] = (errorCounts[key] || 0) + 1
		})
	})
	return errorCounts
}

router.get('/api/auth/logout', async (request: Request, env: Env) => {
	const cookieHeader = request.headers.get('cookie') || ''
	const cookies = parseCookie(cookieHeader)
	const sid = cookies['sid']
	
	if (sid) {
		await env.SESSIONS.delete(`session:${sid}`)
	}
	
	const cookie = serializeCookie('sid', '', { httpOnly: true, sameSite: 'lax', secure: true, path: '/', maxAge: 0 })
	return new Response(null, { status: 302, headers: { location: '/login', 'set-cookie': cookie } })
})

router.get('/api/auth/login', (request: Request, env: Env) => {
	const clientId = (env as unknown as Record<string, string>).GOOGLE_CLIENT_ID
	if (!clientId) return json({ error: 'server not configured' }, 500)
	
	// Extract template from request and encode it in state parameter
	const template = getTemplateFromRequest(request)
	const state = encodeURIComponent(JSON.stringify({ template }))
	
	const redirectUri = getRedirectUri(request)
	const params = new URLSearchParams({
		client_id: clientId,
		redirect_uri: redirectUri,
		response_type: 'code',
		scope: 'openid email https://www.googleapis.com/auth/gmail.readonly',
		access_type: 'offline',
		prompt: 'consent',
		state: state
	})
	return Response.redirect(`${GOOGLE_OAUTH_ENDPOINT}?${params.toString()}`, 302)
})

router.get('/api/auth/callback', async (request: Request, env: Env) => {
	const url = new URL(request.url)
	const code = url.searchParams.get('code')
	const state = url.searchParams.get('state')
	if (!code) return json({ error: 'missing code' }, 400)

	// Extract template from state parameter
	let template = DEFAULT_TEMPLATE
	if (state) {
		try {
			const stateData = JSON.parse(decodeURIComponent(state))
			if (stateData.template && stateData.template.subjectQuery && stateData.template.countryRegex) {
				template = stateData.template
			}
		} catch (e) {
			console.warn('Failed to parse state parameter:', e)
		}
	}

	// For the callback, we need to use the same redirect_uri that was used in the initial OAuth request
	// In local development, this should always be localhost:8787
	const redirectUri = getRedirectUri(request)
	
	// Use environment variable to determine if we're in local development
	const environment = (env as unknown as Record<string, string>).ENVIRONMENT
	const isLocalDevelopment = environment === 'development'
	const finalRedirectUri = isLocalDevelopment 
		? 'http://localhost:8787/api/auth/callback' 
		: redirectUri
	
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
			redirect_uri: finalRedirectUri,
			grant_type: 'authorization_code',
		}).toString(),
	})
	if (!tokenRes.ok) {
		const errorText = await tokenRes.text()
		console.error('Token exchange failed:', {
			status: tokenRes.status,
			statusText: tokenRes.statusText,
			error: errorText
		})
		return json({ 
			error: 'token exchange failed',
			details: errorText,
			status: tokenRes.status,
			redirectUri: finalRedirectUri 
		}, 500)
	}
	const tokenJson = await tokenRes.json() as any
	const accessToken = tokenJson.access_token as string
	const refreshToken = tokenJson.refresh_token as string | undefined

	const sessionId = crypto.randomUUID()
	const sessionData = { accessToken, refreshToken, createdAt: Date.now(), template }
	await env.SESSIONS.put(`session:${sessionId}`, JSON.stringify(sessionData), { expirationTtl: 60 * 60 * 24 * 7 })

	const cookie = serializeCookie('sid', sessionId, { httpOnly: true, sameSite: 'lax', secure: true, path: '/', maxAge: 60 * 60 * 24 * 7 })
	
	// Redirect back to frontend after successful authentication
	const frontendUrl = environment === 'development' ? 'http://localhost:5173' : 'https://mailsalesmap.org'
	return new Response(null, { status: 302, headers: { location: frontendUrl, 'set-cookie': cookie } })
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

router.get('/api/debug', async (request: Request, env: Env) => {
	try {
		const session = await getSession(request, env)
		const accessToken = await ensureAccessToken(env, session)
		if (!accessToken) return json({ error: 'unauthorized' }, 401)
		
		// Get template from session or request parameter, fallback to default
		let template = session?.template || getTemplateFromRequest(request)
		if (!template) template = DEFAULT_TEMPLATE
		
		const query = template.subjectQuery
		
		// Get first page of messages for debugging
		const listUrl = new URL(GMAIL_LIST_ENDPOINT)
		listUrl.searchParams.set('q', query)
		listUrl.searchParams.set('maxResults', '10')
		
		const res = await fetch(listUrl, { headers: { authorization: `Bearer ${accessToken}` } })
		if (!res.ok) {
			return json({ 
				error: 'Gmail API request failed', 
				status: res.status,
				statusText: res.statusText 
			}, res.status)
		}
		
		const listResult = await res.json() as any
		
		const debugInfo: any = {
			template: template,
			searchQuery: query,
			listResponse: listResult,
			messageCount: Array.isArray(listResult.messages) ? listResult.messages.length : 0,
			resultOk: res.ok,
			status: res.status
		}
		
		// If we have messages, get details of the first one
		if (Array.isArray(listResult.messages) && listResult.messages.length > 0) {
			try {
				const firstMessageId = listResult.messages[0]?.id
				if (!firstMessageId) {
					debugInfo.messageError = 'First message has no ID'
					return json(debugInfo)
				}
				const msgRes = await fetch(GMAIL_GET_ENDPOINT(firstMessageId), {
					headers: { authorization: `Bearer ${accessToken}` }
				})
				const msgDetails = await msgRes.json() as any
				
				// Extract email body text for debugging (both plain text and HTML)
				const bodyParts: string[] = []
				function collect(p: any) {
					if (!p || typeof p !== 'object') return
					if ((p.mimeType === 'text/plain' || p.mimeType === 'text/html') && p.body?.data) {
						try { 
							const decoded = atob(p.body.data.replace(/-/g,'+').replace(/_/g,'/'))
							if (decoded && typeof decoded === 'string') {
								bodyParts.push(decoded)
							}
						} catch (e) {
							// Ignore malformed base64 data
						}
					}
					if (Array.isArray(p.parts)) {
						p.parts.forEach((part: any) => collect(part))
					}
				}
				if (msgDetails?.payload) {
					collect(msgDetails.payload)
				}
				const emailText = bodyParts.join('\n')
				
				// Test the country parsing regex from the template
				const countryRegex = new RegExp(template.countryRegex, 'i')
				const countryMatch = emailText.match(countryRegex)
				const countryFound = countryMatch ? countryMatch[1].trim().replace(/\*/g, '').replace(/&\w+;/g, '') : null
				
				debugInfo.firstMessage = {
					id: firstMessageId,
					subject: msgDetails.payload?.headers?.find((h: any) => h?.name?.toLowerCase() === 'subject')?.value || 'No subject',
					from: msgDetails.payload?.headers?.find((h: any) => h?.name?.toLowerCase() === 'from')?.value || 'No sender',
					snippet: msgDetails.snippet || 'No snippet',
					bodyLength: emailText.length,
					bodyPreview: emailText.substring(0, 500) + (emailText.length > 500 ? '...' : ''),
					countryMatch: countryMatch?.[0] || null,
					countryFound: countryFound
				}
			} catch (err) {
				debugInfo.messageError = err instanceof Error ? err.message : 'Failed to fetch message details'
			}
		}
		
		return json(debugInfo)
	} catch (error) {
		return json({ 
			error: 'Debug endpoint failed', 
			details: error instanceof Error ? error.message : 'Unknown error' 
		}, 500)
	}
})

router.get('/api/sales-data', async (request: Request, env: Env) => {
	const session = await getSession(request, env)
	const accessToken = await ensureAccessToken(env, session)
	if (!accessToken) return json({ error: 'unauthorized' }, 401)

	// Get template from session or request parameter, fallback to default
	let template = session?.template || getTemplateFromRequest(request)
	if (!template) template = DEFAULT_TEMPLATE

	const cacheKey = `sales:${session.createdAt}:${template.id}` // include template id in cache key
	const cached = await env.SALES_CACHE.get(cacheKey)
	if (cached) return new Response(cached, { headers: { 'content-type': 'application/json; charset=utf-8' } })

	let nextPageToken: string | undefined
	const messageIds: string[] = []
	const query = template.subjectQuery
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
	const countryTimestamps: Record<string, number[]> = {} // Track all timestamps per country
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
				if (!p || typeof p !== 'object') return
				if ((p.mimeType === 'text/plain' || p.mimeType === 'text/html') && p.body?.data) {
					try { 
						const decoded = atob(p.body.data.replace(/-/g,'+').replace(/_/g,'/'))
						if (decoded && typeof decoded === 'string') {
							bodyParts.push(decoded)
						}
					} catch (e) {
						// Ignore malformed base64 data
					}
				}
				if (Array.isArray(p.parts)) {
					p.parts.forEach((part: any) => collect(part))
				}
			}
			collect(msg.payload)
			const text = bodyParts.join('\n')
			// Use the template's regex pattern to extract country information
			const countryRegex = new RegExp(template.countryRegex, 'i')
			const match = text.match(countryRegex)
			if (match) {
				const country = match[1].trim().replace(/\*/g, '').replace(/&\w+;/g, '')
				if (country && country !== 'IP:' && country.length > 0) {
					counts[country] = (counts[country] || 0) + 1
					
					// Extract timestamp from email (use internalDate which is the received timestamp)
					const timestamp = msg.internalDate ? parseInt(msg.internalDate) : Date.now()
					if (!countryTimestamps[country]) {
						countryTimestamps[country] = []
					}
					countryTimestamps[country].push(timestamp)
				}
			}
		}
	}

	// Create enriched data structure with both counts and timestamps
	const enrichedData: Record<string, { count: number; firstSale: number; lastSale: number }> = {}
	
	for (const [country, count] of Object.entries(counts)) {
		const timestamps = countryTimestamps[country] || []
		if (timestamps.length > 0) {
			enrichedData[country] = {
				count,
				firstSale: Math.min(...timestamps),
				lastSale: Math.max(...timestamps)
			}
		}
	}

	const body = JSON.stringify(enrichedData)
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
