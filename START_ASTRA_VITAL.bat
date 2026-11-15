@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>nul
if errorlevel 1 (
  where python >nul 2>nul
  if errorlevel 1 (
    echo Python was not found on this computer.
    echo You can still try opening index.html directly, but the detailed 3D anatomy module may be blocked by browser file security.
    pause
    start "" "%~dp0index.html"
    exit /b 1
  ) else (
    start "ASTRA-VITAL local server" /min cmd /c "python -m http.server 8765 --bind 127.0.0.1"
  )
) else (
  start "ASTRA-VITAL local server" /min cmd /c "py -m http.server 8765 --bind 127.0.0.1"
)
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:8765/"
echo ASTRA-VITAL is running at http://127.0.0.1:8765/
echo Close the minimized ASTRA-VITAL local server window when you finish.
endlocal
