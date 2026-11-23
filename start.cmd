@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if %errorlevel%==0 (
  node --disable-warning=ExperimentalWarning server\index.js
  goto :end
)

if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" (
  "%LOCALAPPDATA%\Programs\nodejs\node.exe" --disable-warning=ExperimentalWarning server\index.js
  goto :end
)

echo Node.js not found. Install it from https://nodejs.org then run this file again.
pause
:end
endlocal
