# Android Development Environment Setup

## 🔧 Required Setup

### 1. Install Android Studio

Download and install Android Studio from:
https://developer.android.com/studio

### 2. Install Android SDK

1. Open Android Studio
2. Go to **Tools → SDK Manager**
3. Install:
   - Android SDK Platform 33
   - Android SDK Build-Tools 33.0.0
   - Android SDK Platform-Tools
   - Android Emulator

### 3. Set Environment Variables

Add to your `~/.bashrc` or `~/.zshrc`:

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

Then reload:
```bash
source ~/.bashrc
```

### 4. Verify Installation

```bash
# Check adb
adb version

# Check Android SDK
echo $ANDROID_HOME

# List available emulators
emulator -list-avds
```

### 5. Create an Android Emulator (if needed)

1. Open Android Studio
2. Go to **Tools → Device Manager**
3. Click **Create Device**
4. Select a device (e.g., Pixel 5)
5. Select a system image (e.g., Android 13 - API 33)
6. Finish setup

### 6. Start Emulator

```bash
# List available emulators
emulator -list-avds

# Start an emulator
emulator -avd <emulator-name>
```

Or use Android Studio: **Tools → Device Manager → Play button**

### 7. Connect Physical Device

1. Enable **Developer Options** on your Android device:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   
2. Enable **USB Debugging**:
   - Go to Settings → Developer Options
   - Enable "USB Debugging"

3. Connect via USB:
   ```bash
   adb devices
   ```

4. Allow USB debugging on device when prompted

---

## 🚀 Quick Setup Commands

### For WSL/Linux:

```bash
# Install Android SDK (if using SDK command line tools)
mkdir -p ~/Android/Sdk
cd ~/Android/Sdk

# Download command line tools from:
# https://developer.android.com/studio#command-tools

# Set environment variables
echo 'export ANDROID_HOME=$HOME/Android/Sdk' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/emulator' >> ~/.bashrc
source ~/.bashrc
```

---

## ✅ Verification Checklist

- [ ] Android Studio installed
- [ ] Android SDK Platform 33 installed
- [ ] Android SDK Platform-Tools installed
- [ ] ANDROID_HOME environment variable set
- [ ] adb is in PATH
- [ ] Emulator created OR physical device connected
- [ ] USB debugging enabled (for physical device)

---

## 🐛 Troubleshooting

### adb not found
- Make sure Android SDK Platform-Tools is installed
- Check ANDROID_HOME is set correctly
- Verify PATH includes platform-tools

### No emulators found
- Create an emulator in Android Studio
- Or connect a physical device

### Device not detected
- Check USB cable
- Enable USB debugging
- Try `adb kill-server && adb start-server`
- Check `adb devices` output

---

## 📝 Next Steps

After setup:
1. Verify: `adb devices` (should show device/emulator)
2. Run: `npm run android`

