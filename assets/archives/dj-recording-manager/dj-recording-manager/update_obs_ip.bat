@echo off
echo Updating OBS IP address in main.js...

powershell -Command "(Get-Content ..\dj-manager-desktop\main.js) -replace \"address: '192\.168\.68\.1:4444',\", \"address: '127.0.0.1:4444',\" | Set-Content ..\dj-manager-desktop\main.js"

echo.
echo IP address updated from 192.168.68.1:4444 to 127.0.0.1:4444
echo Please restart the application to apply changes.
echo.
pause 