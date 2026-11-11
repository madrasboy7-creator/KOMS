@echo off
echo =======================================================
echo Connecting KOMS to Android Phone
echo =======================================================
"%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" reverse tcp:8443 tcp:8443
"%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" reverse tcp:5000 tcp:5000
echo Launching KOMS Android app on phone...
"%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" shell am start -n com.koms.app/.ui.auth.SplashActivity
echo Done! Native KOMS Android app is now running on your phone.
pause

