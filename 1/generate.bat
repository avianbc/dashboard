@echo off
echo ===================================
echo Fitness Dashboard Data Generator
echo ===================================
echo.

REM Try different Python commands
where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Using: python
    python generate_dashboard.py
    goto :done
)

where py >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Using: py
    py generate_dashboard.py
    goto :done
)

where python3 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Using: python3
    python3 generate_dashboard.py
    goto :done
)

echo ERROR: Python not found!
echo.
echo Please install Python from: https://www.python.org/downloads/
echo Or run: winget install Python.Python.3.14
echo.
echo After installing, restart this terminal and try again.
pause
exit /b 1

:done
echo.
echo ===================================
echo Done! Now open dashboard.html
echo ===================================
echo.
pause
