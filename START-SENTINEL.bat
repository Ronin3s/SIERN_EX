@echo off
:: Sentinel - Windows One-Click Launcher
:: Double-click this file to set up and launch Sentinel.

echo.
echo =============================================
echo    Sentinel - Starting Setup...
echo =============================================
echo.

:: Handle UNC paths - copy project locally first if running from network share
set "SCRIPT_DIR=%~dp0"
echo Detected path: %SCRIPT_DIR%

echo %SCRIPT_DIR% | findstr /i "^\\\\" >nul
if %errorlevel%==0 (
    echo Running from network share - copying project to Desktop...
    set "LOCAL_DIR=%USERPROFILE%\Desktop\SIERN_EX"
    if not exist "%USERPROFILE%\Desktop\SIERN_EX" mkdir "%USERPROFILE%\Desktop\SIERN_EX"
    xcopy "%SCRIPT_DIR%*" "%USERPROFILE%\Desktop\SIERN_EX\" /E /I /Y /Q
    echo Copied to %USERPROFILE%\Desktop\SIERN_EX
    echo.
    cd /d "%USERPROFILE%\Desktop\SIERN_EX"
) else (
    cd /d "%SCRIPT_DIR%"
)

PowerShell -ExecutionPolicy Bypass -File "%CD%\setup-windows.ps1"

pause
