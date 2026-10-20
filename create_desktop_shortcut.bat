@echo off
title Create Desktop Shortcut
color 0b
echo ====================================================================
echo         MM6026 VALUATION APP: CREATE DESKTOP SHORTCUT
echo ====================================================================
echo.

set "SCRIPT_DIR=%~dp0"
set "TARGET_BAT=%SCRIPT_DIR%run_app.bat"
set "SHORTCUT_PATH=%USERPROFILE%\Desktop\MM6026 Valuation Platform.lnk"

echo Creating shortcut on your Desktop...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%SHORTCUT_PATH%'); $Shortcut.TargetPath = '%TARGET_BAT%'; $Shortcut.WorkingDirectory = '%SCRIPT_DIR%'; $Shortcut.Description = 'MM6026 Digital Business Valuation Platform'; $Shortcut.Save()"

if exist "%SHORTCUT_PATH%" (
    echo.
    echo [SUCCESS] Shortcut created on your Desktop!
    echo Name: "MM6026 Valuation Platform"
    echo Location: %SHORTCUT_PATH%
    echo.
    echo You can now just double-click the shortcut on your Desktop anytime.
) else (
    echo.
    echo [NOTICE] Could not automatically create shortcut.
    echo You can manually right-click "run_app.bat" and select "Send to -> Desktop (create shortcut)".
)

echo.
pause
