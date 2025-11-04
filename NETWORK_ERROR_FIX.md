# 🔧 Network Error Fix - Troubleshooting Guide

## ✅ Changes Made

1. **Improved Error Handling**:
   - Added detailed error logging in `api.js`
   - Added specific network error detection in `authService.js`
   - Better error messages for users

2. **Increased Timeout**:
   - Changed from 10 seconds to 30 seconds
   - Gives more time for slow connections

3. **Better Debugging**:
   - Console logs API base URL on initialization
   - Detailed error logging for troubleshooting

---

## 🔍 Common Network Error Causes

### 1. **Backend Not Running**
**Symptom**: "Network Error" immediately

**Solution**:
```bash
# In a separate terminal, start the backend:
cd /home/irfan/tracksy/backend
php artisan serve
```

**Verify**:
- Backend should show: "Laravel development server started: http://127.0.0.1:8000"
- Open browser: `http://localhost:8000/api/auth/login` (should show error, not connection refused)

---

### 2. **CORS Issues**
**Symptom**: Network error in browser console with CORS error

**Solution**: Already configured in `backend/config/cors.php`:
- `localhost:8081` is in allowed origins ✅

**If still issues**, try:
```bash
cd backend
php artisan config:clear
php artisan cache:clear
```

---

### 3. **Wrong API URL**
**Symptom**: Network error immediately

**Check**: 
- Open browser console (F12)
- Look for: `🌐 API Base URL: http://localhost:8000/api`
- Should match your backend URL

**Fix**: Update `student-app/src/constants/index.js` if needed

---

### 4. **Backend Port Mismatch**
**Symptom**: Network error, backend running but different port

**Check**:
- Backend terminal shows which port it's on
- Usually `127.0.0.1:8000` or `localhost:8000`

**Fix**: Make sure API_BASE_URL matches

---

## 🧪 Testing Steps

### Step 1: Verify Backend is Running
```bash
# Check if backend is running
ps aux | grep "php artisan serve"

# If not running, start it:
cd /home/irfan/tracksy/backend
php artisan serve
```

### Step 2: Test Backend API Directly
```bash
# Test login endpoint
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Should return JSON (even if error, not connection refused)
```

### Step 3: Check Browser Console
1. Open browser (F12)
2. Go to **Console** tab
3. Look for:
   - `🌐 API Base URL: http://localhost:8000/api`
   - Any red error messages
   - Network errors

### Step 4: Check Network Tab
1. Open browser (F12)
2. Go to **Network** tab
3. Try to login
4. Look for request to `/api/auth/login`
5. Check:
   - **Status**: Should be 200, 401, or 422 (not failed)
   - **Response**: Should show JSON response
   - **Headers**: Check CORS headers

---

## 🐛 Debugging Network Errors

### Browser Console Messages

**Good Signs**:
```
🌐 API Base URL: http://localhost:8000/api
🔐 Logging in user: email@example.com
✅ Login API response: {...}
```

**Bad Signs**:
```
❌ Login error: Network Error
Error details: { message: 'Network Error', code: 'ERR_NETWORK' }
```

### Common Error Codes

- **ERR_NETWORK**: Cannot reach server
  - Backend not running
  - Wrong URL
  - Firewall blocking

- **ECONNABORTED**: Request timeout
  - Server too slow
  - Network issues

- **CORS Error**: Cross-origin request blocked
  - CORS not configured
  - Wrong origin

---

## ✅ Quick Fix Checklist

1. [ ] **Backend is running**: `php artisan serve` in terminal
2. [ ] **Backend accessible**: `http://localhost:8000` works in browser
3. [ ] **API URL correct**: Check console for `🌐 API Base URL`
4. [ ] **CORS configured**: `localhost:8081` in `cors.php`
5. [ ] **No firewall**: Firewall not blocking port 8000
6. [ ] **Browser console checked**: No CORS errors
7. [ ] **Network tab checked**: Request status and response

---

## 🚀 If Still Not Working

1. **Check Backend Logs**:
   ```bash
   # In backend terminal, look for errors
   ```

2. **Test with Postman/curl**:
   ```bash
   curl -X POST http://localhost:8000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","password":"test123"}'
   ```

3. **Check Laravel Logs**:
   ```bash
   cd backend
   tail -f storage/logs/laravel.log
   ```

4. **Clear Laravel Cache**:
   ```bash
   cd backend
   php artisan config:clear
   php artisan cache:clear
   php artisan route:clear
   ```

---

## 📝 Expected Behavior

### When Working:
1. User clicks "Sign In"
2. Browser console shows: `🔐 Logging in user: ...`
3. Network tab shows: `POST /api/auth/login` with status 200 or 401
4. Either success or specific error message (not "Network Error")

### When Not Working:
1. User clicks "Sign In"
2. Browser console shows: `❌ Login error: Network Error`
3. Network tab shows: Request failed or pending forever
4. Error message: "Network Error: Cannot connect to server..."

---

**Most likely cause**: Backend not running. Start it with `php artisan serve` in the backend directory.

