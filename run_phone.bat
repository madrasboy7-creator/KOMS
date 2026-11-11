@echo off
echo =======================================================
echo Connecting KOMS to Android Phone
echo =======================================================
"%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" reverse tcp:8443 tcp:8443
"%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" reverse tcp:5000 tcp:5000
echo Launching KOMS app on phone...
"%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" shell monkey -p com.example.koms -c android.intent.category.LAUNCHER 1
echo Done! App should now be open on your phone.
pause

