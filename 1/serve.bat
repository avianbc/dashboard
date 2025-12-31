@echo off
echo ========================================
echo Starting Local Web Server
echo ========================================
echo.
echo Dashboard will open at: http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Try Python's built-in HTTP server
where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    start http://localhost:8000/dashboard.html
    python -m http.server 8000
    goto :eof
)

where py >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    start http://localhost:8000/dashboard.html
    py -m http.server 8000
    goto :eof
)

echo ERROR: Python not found!
pause
