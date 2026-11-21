@echo off
setlocal enabledelayedexpansion

REM Ensure Git is in PATH
set "PATH=%LOCALAPPDATA%\Programs\Git\cmd;C:\Program Files\Git\cmd;%PATH%"

echo =======================================================
echo  KOMS - Sync Local Updates to GitHub
echo  Repository: https://github.com/madrasboy7-creator/KOMS.git
echo =======================================================
echo.

REM Stage all changes
echo Staging changes...
git add -A

REM Check if there are changes to commit
git diff-index --quiet HEAD --
if %ERRORLEVEL% equ 0 (
    echo No new changes to commit. Pushing existing local commits...
) else (
    set /p "commit_msg=Enter commit message (press Enter for default): "
    if "!commit_msg!"=="" set "commit_msg=chore: update project files %date% %time%"
    git commit -m "!commit_msg!"
)

echo.
echo Pushing to GitHub (origin/main)...
git push origin main

echo.
if %ERRORLEVEL% equ 0 (
    echo =======================================================
    echo  SUCCESS: Your updates have been pushed to GitHub!
    echo =======================================================
) else (
    echo =======================================================
    echo  Push failed. If prompted, please provide your GitHub
    echo  Personal Access Token (PAT) or credentials.
    echo =======================================================
)

pause


