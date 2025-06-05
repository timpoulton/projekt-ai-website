@echo off
echo Creating audio converter folder...
mkdir audio-converter 2>nul
cd audio-converter

echo Creating script files...
copy "%~dp0convertToWav.js" . >nul

echo Installing dependencies...
call npm init -y >nul

echo Running conversion...
node convertToWav.js

echo.
pause 