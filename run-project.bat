@echo off
REM Quick Start Script for Waste Management Project (Windows)

echo.
echo ==========================================
echo Waste Management Project - Quick Start
echo ==========================================
echo.

REM Start Django Backend
echo Starting Django Backend...
echo.
start cmd /k "cd backend\Myproject && env\Scripts\activate && python manage.py runserver"

REM Wait a bit for backend to start
timeout /t 3

REM Start React Frontend
echo Starting React Frontend...
echo.
start cmd /k "cd frontend\MyRProject && npm run dev"

echo.
echo ==========================================
echo Servers starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo Admin: http://localhost:8000/admin
echo ==========================================
echo.
pause
