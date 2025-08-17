# 🚀 Sales Mapper Deployment Guide

## Current Issue: API Token Authentication

Your current Cloudflare API token is invalid or has insufficient permissions. Here's how to fix it:

## 1. Create New Cloudflare API Token

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Click **"Create Token"**
3. Use **"Edit Cloudflare Workers"** template or create custom token
4. Set these **exact permissions**:

```
Account Permissions:
- Account:Read
- Workers Scripts:Edit
- Workers KV Storage:Edit  
- Cloudflare Pages:Edit

Zone Permissions:
- Zone:Read

Account Resources:
- Include: a7dd2a2bee7151ef4dc7a9f53d99b520

Zone Resources:  
- Include: beveradb.com
```

5. **Copy the token** (it should be 40+ characters long)

## 2. Update Your Credentials

### Local Development (.env file):
```bash
CLOUDFLARE_ACCOUNT_ID=a7dd2a2bee7151ef4dc7a9f53d99b520
CLOUDFLARE_API_TOKEN=YOUR_NEW_TOKEN_HERE
```

### GitHub Secrets:
Go to: https://github.com/beveradb/email-sales-country-map/settings/secrets/actions

Update:
- `CLOUDFLARE_API_TOKEN` = your new token
- `CLOUDFLARE_ACCOUNT_ID` = a7dd2a2bee7151ef4dc7a9f53d99b520

## 3. Create Cloudflare Pages Project

1. Go to [Cloudflare Dashboard → Pages](https://dash.cloudflare.com/pages)
2. Click **"Create application"**
3. Choose **"Connect to Git"**
4. Select your GitHub repo: `beveradb/email-sales-country-map`
5. Configure:
   - **Project name**: `emailsalesmap`
   - **Production branch**: `main`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `frontend`

## 4. Verify Domain Setup

Your domain setup looks correct in the screenshots:
- ✅ Route: `emailsalesmap.beveradb.com/api/*` → `sales-mapper-worker`
- ✅ Custom domain: `emailsalesmap.beveradb.com`

## 5. Test Deployment

After updating the API token:

1. Push any change to trigger GitHub Actions:
   ```bash
   git commit --allow-empty -m "Trigger deployment with new API token"
   git push
   ```

2. Monitor the Actions at: https://github.com/beveradb/email-sales-country-map/actions

3. Both workflows should succeed:
   - ✅ **Deploy Worker** - handles `/api/*` endpoints
   - ✅ **Deploy Frontend** - serves the React app

## 6. Test the Application

Once deployed, visit: https://emailsalesmap.beveradb.com

1. Click **"Sign in with Google"**
2. Grant Gmail permissions  
3. Watch the world map populate with your sales data!

## Troubleshooting

If you still get authentication errors:

1. **Double-check token permissions** - ensure all 5 permissions are set
2. **Verify account/zone resources** - must include your account ID and domain
3. **Check token format** - should be 40+ characters, no spaces/quotes
4. **Wait 5 minutes** - tokens can take time to propagate

## Current Status

- ✅ Code is ready and builds successfully
- ✅ GitHub Actions workflows configured  
- ✅ Worker configuration with KV namespaces
- ✅ Domain routing configured
- ❌ **API token needs to be recreated** (main blocker)
- ❌ Cloudflare Pages project needs to be created

Once you fix the API token, everything should deploy automatically! 🎉
