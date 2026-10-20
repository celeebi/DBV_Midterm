@echo off
title MM6026 Digital Business Valuation Platform
color 0b
echo ====================================================================
echo             MM6026 DIGITAL BUSINESS VALUATION PLATFORM
echo                    Institutional Fintech Engine
echo ====================================================================
echo.

cd /d "%~dp0"

:: 1. Check if virtual environment exists
if exist ".venv\Scripts\python.exe" (
    echo [OK] Local Python virtual environment detected.
    set "PYTHON_CMD=.venv\Scripts\python.exe"
    goto :LAUNCH
)

:: 2. Fallback check for system Python
where python >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] Using system-installed Python...
    set "PYTHON_CMD=python"
    goto :LAUNCH
)

echo [ERROR] Python is not installed or not in your system PATH.
echo Please install Python 3.10+ from https://www.python.org/downloads/
echo and ensure "Add Python to PATH" is checked.
echo.
pause
exit /b 1

:LAUNCH
echo.
echo ====================================================================
echo [OK] Starting local asynchronous valuation server...
echo [OK] Opening dashboard in your default web browser at http://localhost:8000
echo ====================================================================
echo.
echo (Keep this terminal window open while using the platform. Press Ctrl+C to stop.)
echo.

"%PYTHON_CMD%" server.py

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] The server stopped unexpectedly.
    echo See error details above.
    pause
)
