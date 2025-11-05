@echo off
title Expo Development Server
echo ========================================
echo Starting Expo Development Server
echo ========================================
echo.
echo Clearing Metro cache and starting bundler...
echo Using port 8082 to avoid conflicts
echo.

call npx expo start --clear --port 8082

echo.
if %ERRORLEVEL% NEQ 0 (
    echo Error occurred. Press any key to try alternative method...
    pause > nul
    echo.
    echo Trying alternative method...
    call npx expo start --port 8082
)

echo.
echo Server should be running. Check the output above for QR code.
echo Press any key to exit...
pause > nul
