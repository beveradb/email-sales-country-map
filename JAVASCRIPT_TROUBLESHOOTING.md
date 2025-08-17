# JavaScript Loading Troubleshooting Guide

This guide helps diagnose and fix issues where users see the HTML fallback page instead of the React application.

## Quick Diagnostic Steps

### 1. Check Browser Console
When users report seeing the fallback page, ask them to:
1. Open browser developer tools (F12)
2. Go to the Console tab
3. Look for diagnostic messages starting with 🔍, 🚨, or ✅
4. Share any error messages or the full diagnostic JSON

### 2. Check Network Tab
In browser developer tools:
1. Go to Network tab
2. Reload the page
3. Look for failed requests (red entries)
4. Check if `/src/main.tsx` loads successfully
5. Verify all JavaScript/CSS assets load with 200 status

### 3. Access Diagnostic Data
Visit `/api/diagnostics` (admin only) to see collected diagnostic reports from users experiencing issues.

## Common Issues and Solutions

### Issue 1: ES Module Support
**Symptoms:** Browser shows "ES Modules not supported" in console
**Cause:** Very old browsers (IE, old Safari/Chrome)
**Solution:** Consider adding a legacy build or display browser upgrade notice

### Issue 2: Content Security Policy (CSP)
**Symptoms:** Console errors about blocked scripts, `unsafe-eval` errors
**Cause:** Strict CSP headers blocking module execution
**Solutions:**
- Check server CSP headers
- Ensure `script-src` allows `'self'` and `'unsafe-inline'` if needed
- For development, temporarily disable CSP to test

### Issue 3: MIME Type Issues
**Symptoms:** Console errors about incorrect MIME types for JS files
**Cause:** Server not serving `.js` files with `application/javascript` MIME type
**Solutions:**
- Configure web server to serve JS files with correct MIME type
- Check Cloudflare or CDN settings if using one

### Issue 4: Network/CDN Issues
**Symptoms:** Module loading timeout, 404 errors for JS files
**Cause:** Build artifacts not deployed or CDN issues
**Solutions:**
- Verify build process completed successfully
- Check that `dist/` folder contains all necessary files
- Clear CDN cache if using one
- Test direct server access bypassing CDN

### Issue 5: BrowserStack/Testing Environment Issues
**Symptoms:** Works locally but fails in testing environments
**Cause:** Testing environments may have different network/security policies
**Solutions:**
- Check if testing environment blocks external resources
- Verify testing environment supports ES modules
- Consider using testing environment's specific configuration

### Issue 6: Third-party Script Interference
**Symptoms:** App works sometimes, fails other times
**Cause:** Ad blockers, security software, or other scripts interfering
**Solutions:**
- Test in incognito/private mode
- Disable browser extensions temporarily
- Check for console errors from other scripts

## Diagnostic Features Added

### 1. Visual Loading Indicator
- Shows green loading bar when JavaScript is enabled
- Turns red if loading fails
- Displays current loading status

### 2. Enhanced Error Tracking
- Captures all JavaScript errors and promise rejections
- Tracks module loading timeouts
- Records browser compatibility issues

### 3. Automatic Reporting
- Sends diagnostic data to `/api/diagnostics` endpoint
- Includes browser info, errors, and timing data
- Stored temporarily for analysis

### 4. Fallback Content Enhancement
- Shows clear error message when app fails to load
- Distinguishes between JS disabled vs loading failure
- Provides troubleshooting hints for users

## Testing the Fixes

### Local Testing
1. Build the application: `npm run build`
2. Serve the built files locally
3. Open browser console and look for diagnostic messages
4. Verify the loading indicator appears and disappears correctly

### BrowserStack Testing
1. Deploy the updated code
2. Test in BrowserStack responsive tool
3. Check console for diagnostic messages
4. Verify error reporting works correctly

### Production Testing
1. Monitor `/api/diagnostics` endpoint for incoming reports
2. Check server logs for diagnostic data
3. Compare error rates before and after the fix

## Monitoring and Maintenance

### Regular Checks
- Review diagnostic reports weekly
- Monitor common error patterns
- Update troubleshooting guide based on new issues

### Performance Impact
- Diagnostic code adds minimal overhead (~2KB)
- Only runs when issues are detected
- Automatically cleans up after successful loads

### Privacy Considerations
- Diagnostic data expires after 24 hours
- No personal information is collected
- Only technical error information is stored

## Advanced Debugging

### Custom Diagnostic Parameters
Add URL parameters for additional debugging:
- `?debug=1` - Enable verbose console logging
- `?skip_cache=1` - Bypass browser cache
- `?force_fallback=1` - Force show fallback content

### Manual Error Simulation
For testing error handling:
```javascript
// In browser console
window.loadingErrors.push({
  type: 'test_error',
  message: 'Simulated error for testing',
  timestamp: Date.now()
});
```

### Server-Side Debugging
Check Cloudflare Worker logs:
```bash
wrangler tail
```

## Contact and Support

If issues persist after trying these solutions:
1. Collect full diagnostic data from affected users
2. Check recent changes to build process or deployment
3. Test with minimal configuration to isolate the issue
4. Consider browser-specific workarounds if needed

Remember: The goal is to identify why JavaScript modules aren't loading, not just to hide the problem. The diagnostic tools help pinpoint the exact cause for targeted fixes.