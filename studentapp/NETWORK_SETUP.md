# 🌐 Network Setup for Physical Device Testing

## Problem
The app is trying to connect to `localhost:8000`, which doesn't work on a physical Android device. `localhost` on your phone refers to the phone itself, not your computer.

---

## ✅ Solution: Use Your Computer's IP Address

### Step 1: Find Your Computer's IP Address

**On Windows (Command Prompt or PowerShell):**
```cmd
ipconfig
```
Look for "IPv4 Address" under your active network adapter (usually Wi-Fi or Ethernet).

**On Linux/WSL:**
```bash
hostname -I
```
Or:
```bash
ip addr show | grep "inet " | grep -v "127.0.0.1"
```

**On Mac:**
```bash
ifconfig | grep "inet " | grep -v "127.0.0.1"
```

You'll get something like: `192.168.1.100` or `10.0.0.5`

---

### Step 2: Update the API Configuration

I've updated `src/constants/index.js` to use an IP address instead of localhost.

**You need to change this line:**
```javascript
const LOCAL_IP = '192.168.1.100'; // CHANGE THIS to your computer's IP address
```

Replace `192.168.1.100` with your actual IP address.

---

### Step 3: Make Sure Backend is Accessible

**Start your backend server:**
```bash
cd ~/tracksy/backend
php artisan serve --host=0.0.0.0 --port=8000
```

The `--host=0.0.0.0` is important - it makes the server accessible from other devices on your network.

---

### Step 4: Rebuild the APK

After updating the IP address, rebuild the APK:

```bash
cd ~/tracksy/student-app
npx eas-cli build --platform android --profile preview
```

---

## 🔍 Quick Checklist

- [ ] Found your computer's IP address
- [ ] Updated `LOCAL_IP` in `src/constants/index.js`
- [ ] Backend is running with `--host=0.0.0.0`
- [ ] Both phone and computer are on the same Wi-Fi network
- [ ] Rebuilt the APK with the new IP address

---

## 📝 Important Notes

1. **Same Network**: Your phone and computer must be on the same Wi-Fi network.

2. **Firewall**: Make sure your firewall allows incoming connections on port 8000.

3. **IP Address Changes**: If your IP address changes (common with DHCP), you'll need to update the code and rebuild.

4. **Alternative**: For production, use a real domain/server instead of localhost.

---

## 🚀 Quick Fix Command

After finding your IP, run:
```bash
# Find your IP
MY_IP=$(hostname -I | awk '{print $1}')

# Update the file (replace the IP in constants/index.js)
# Then rebuild
cd ~/tracksy/student-app
npx eas-cli build --platform android --profile preview
```

---

**After updating the IP and rebuilding, the app should connect to your backend!** 🎉

