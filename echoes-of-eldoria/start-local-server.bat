@echo off
REM This batch file starts a simple HTTP server on port 5500 using Python

REM Check if python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed or not in PATH. Please install Python to run the local server.
    pause
    exit /b 1
)

REM Start the HTTP server on port 5500
echo Starting local server at http://localhost:5500
python -m http.server 5500
