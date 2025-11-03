# Transfer Tracksy Project to Ubuntu - Step by Step Guide

## 🔄 Transfer Methods

### Method 1: Using USB/External Drive (Easiest)

**On Windows:**
1. Copy the entire `E:\tracksy` folder to your USB drive
2. Safely eject the USB

**On Ubuntu:**
```bash
# Plug in USB drive
# Ubuntu will usually mount it automatically

# Find where it's mounted
lsblk
# Or check:
df -h

# Usually mounted at: /media/username/USB_NAME

# Copy to your home directory
cp -r /media/irfan/USB_NAME/tracksy ~/tracksy

# Or to a projects folder
mkdir -p ~/projects
cp -r /media/irfan/USB_NAME/tracksy ~/projects/
cd ~/projects/tracksy
```

---

### Method 2: Using Git (If project is in repository)

If the project is in a Git repository:

```bash
# Clone the repository
git clone <repository-url> tracksy
cd tracksy
```

If you're not sure about the repository URL, check on Windows:
- Look for `.git` folder in `E:\tracksy`
- Or check if it's on GitHub/GitLab

---

### Method 3: Using SCP (Network Transfer)

If your Ubuntu and Windows machines are on the same network:

**On Windows (PowerShell - with OpenSSH):**
```powershell
# Check if OpenSSH is available
scp -r E:\tracksy irfan@ubuntu-ip:/home/irfan/
```

Replace `ubuntu-ip` with your Ubuntu machine's IP address.

**Find Ubuntu IP:**
```bash
# On Ubuntu, run:
ip addr show
# Or
hostname -I
```

---

### Method 4: Using WSL2 (If using Windows Subsystem for Linux)

If you're using WSL2, you can access Windows files directly:

```bash
# In WSL2 Ubuntu
cd /mnt/e/tracksy
```

---

### Method 5: Using Shared Network Folder

If both machines share a network folder:

```bash
# Mount network share (if needed)
# Then copy
cp -r /path/to/network/share/tracksy ~/tracksy
```

---

## ✅ After Transfer

Once transferred, verify the project structure:

```bash
cd ~/tracksy
ls -la

# You should see:
# - backend/
# - admin-dashboard/
# - student-app/
# - driver-app/
# - README.md
```

---

## 🚀 Next Steps

After transfer, follow the Ubuntu setup guide:

1. **Check current directory:**
```bash
pwd
# Should show: /home/irfan/tracksy (or wherever you copied it)
```

2. **Verify project structure:**
```bash
ls -la
```

3. **Follow setup guide:**
```bash
# Read the Ubuntu setup guide
cat UBUNTU_SETUP_GUIDE.md
```

4. **Start with backend setup:**
```bash
cd backend
chmod +x setup.sh
./setup.sh
```

---

## 🆘 Troubleshooting

### "Permission denied"
```bash
# Fix permissions
sudo chown -R $USER:$USER ~/tracksy
```

### "No space left on device"
```bash
# Check available space
df -h

# Clean up if needed
```

### Files not transferring completely
- Make sure to copy hidden files (`.git`, `.env.example`, etc.):
```bash
cp -r /path/to/source/tracksy ~/tracksy
# -r flag includes all files recursively
```

