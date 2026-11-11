@echo off
setlocal enabledelayedexpansion

echo =======================================================
echo KOMS - Karate Organization Management System
echo Native Android Build & Device Runner
echo =======================================================

set ADB="%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe"

if not exist %ADB% (
    echo [ERROR] ADB not found at %ADB%
    echo Please verify Android SDK is installed.
    pause
    exit /b 1
)

echo [1/5] Detecting connected Android devices...
%ADB% devices

for /f "skip=1 tokens=1" %%d in ('%ADB% devices') do (
    if not "%%d"=="" (
        set DEVICE=%%d
        goto :device_found
    )
)

echo [ERROR] No Android device connected!
echo Please connect your phone via USB with USB debugging enabled.
pause
exit /b 1

:device_found
echo [SUCCESS] Found target Android device: %DEVICE%

echo [2/5] Configuring port forwarding for development...
%ADB% reverse tcp:5000 tcp:5000
%ADB% reverse tcp:8443 tcp:8443

echo [3/5] Compiling Native Android Jetpack Compose APK...
cd /d "%~dp0android"
call gradlew.bat assembleDebug
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Android build failed with error code %ERRORLEVEL%!
    pause
    exit /b %ERRORLEVEL%
)

cd /d "%~dp0"
if not exist "releases" mkdir "releases"
copy /y "android\app\build\outputs\apk\debug\app-debug.apk" "releases\koms-debug.apk" >nul
copy /y "android\app\build\outputs\apk\debug\app-debug.apk" "releases\koms-release.apk" >nul

echo [4/5] Installing KOMS Native Android App on %DEVICE%...
%ADB% install -r "releases\koms-debug.apk"
if %ERRORLEVEL% neq 0 (
    echo [ERROR] APK installation failed!
    pause
    exit /b %ERRORLEVEL%
)

echo [5/5] Launching KOMS Native Application...
%ADB% shell am start -n com.koms.app/.MainActivity

echo =======================================================
echo [DONE] KOMS Native Android App is running on your phone!
echo Package: com.koms.app
echo =======================================================
pause
