# ForkFlow CRM Login Debug Guide

## Issue: Login succeeds but doesn't redirect to dashboard

### Immediate Testing Steps:

1. **Try Simple Demo Mode First** (most reliable):
   ```
   http://localhost:5174/?simple=true
   ```
   - This bypasses all complex authentication
   - Should show a working demo immediately

2. **Try Demo Mode** (uses fake authentication):
   ```
   http://localhost:5174/?mode=demo
   ```
   - Use credentials: demo@forkflow.com / Demo123!
   - Check console for login messages

3. **Check Browser Console After Login:**
   - Open Dev Tools (F12) → Console
   - Look for these messages:
     - "🚀 Login attempt in [mode] mode"
     - "✅ Login successful"
     - "Authentication state updated"

4. **Check Local Storage:**
   - Dev Tools → Application → Local Storage
   - After login, look for:
     - `user` key with user data
     - `RaStore.ForkFlowCRM.auth` with auth data

### Common Issues & Solutions:

#### Issue 1: Authentication state not updating
**Solution**: Clear browser storage and try again
```javascript
// Run in console:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

#### Issue 2: Wrong authentication mode
**Solution**: Force demo mode with URL parameter
```
http://localhost:5174/?mode=demo
```

#### Issue 3: React-Admin not detecting auth change
**Solution**: Check for this error in console and refresh page

### Emergency Fix: Force Navigation
If login works but doesn't redirect, try this in browser console after login:
```javascript
window.location.href = '/';
```

### Verify Authentication State
After login, run this in console to check auth state:
```javascript
// Check if user is stored
console.log('User in localStorage:', localStorage.getItem('user'));

// Check React-Admin auth state
console.log('Auth store:', localStorage.getItem('RaStore.ForkFlowCRM.auth'));
```

### Test Results Format:
Please provide:
1. Which URL you're using
2. Console messages after login attempt
3. Local storage contents after login
4. Current browser URL after "successful" login