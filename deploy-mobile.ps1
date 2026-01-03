# RuraLens Mobile Deployment Script
# This script builds and deploys the app to connected Android device

Write-Host "RuraLens Mobile Deployment" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Build the web app
Write-Host "Step 1/5: Building web application..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Web build complete" -ForegroundColor Green
Write-Host ""

# Step 2: Sync to Android
Write-Host "Step 2/5: Syncing to Android..." -ForegroundColor Yellow
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Host "Sync failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Sync complete" -ForegroundColor Green
Write-Host ""

# Step 3: Build APK
Write-Host "Step 3/5: Building APK..." -ForegroundColor Yellow
cd android
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
.\gradlew.bat assembleDebug
if ($LASTEXITCODE -ne 0) {
    Write-Host "APK build failed!" -ForegroundColor Red
    cd ..
    exit 1
}
Write-Host "APK built successfully" -ForegroundColor Green
Write-Host ""

# Step 4: Check device connection
Write-Host "Step 4/5: Checking device connection..." -ForegroundColor Yellow
$env:Path += ";C:\Users\abhis\AppData\Local\Android\Sdk\platform-tools"
$devices = adb devices | Select-String "device$"
if ($devices.Count -eq 0) {
    Write-Host "No device connected!" -ForegroundColor Red
    Write-Host "Please connect your phone via USB and enable USB debugging" -ForegroundColor Yellow
    cd ..
    exit 1
}
Write-Host "Device connected" -ForegroundColor Green
Write-Host ""

# Step 5: Install APK
Write-Host "Step 5/5: Installing APK on device..." -ForegroundColor Yellow
adb install -r app\build\outputs\apk\debug\app-debug.apk
if ($LASTEXITCODE -ne 0) {
    Write-Host "Installation failed!" -ForegroundColor Red
    cd ..
    exit 1
}
Write-Host "APK installed successfully" -ForegroundColor Green
Write-Host ""

# Launch the app
Write-Host "Launching app..." -ForegroundColor Cyan
adb shell am start -n com.yourorg.ruralens/.MainActivity
Write-Host ""

cd ..

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Check your phone - the app should be running!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tips:" -ForegroundColor Yellow
Write-Host "  - Use Chrome DevTools (chrome://inspect) to debug" -ForegroundColor Gray
Write-Host "  - Check logs using: adb logcat" -ForegroundColor Gray
Write-Host ""
