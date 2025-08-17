# Email Sales Map

Data visualization tool that authenticates with Google, reads specific emails from Gmail, aggregates country data, and displays it on an interactive world map.

## 🚀 Live Demo
- **Frontend**: https://emailsalesmap.beveradb.com
- **API**: https://emailsalesmap.beveradb.com/api/health

## 🏗️ Architecture
- **Frontend**: React + TypeScript + Vite (served by Cloudflare Pages)
- **Backend**: Cloudflare Worker (handles OAuth and Gmail API)
- **Storage**: Cloudflare KV (sessions and caching)

## 🛠️ Local Development
```bash
# Frontend
cd frontend && npm install && npm run dev

# Worker  
cd worker && npm install && npx wrangler dev
```
