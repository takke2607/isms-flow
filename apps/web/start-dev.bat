@echo off
echo Starting ISMS-Flow development server...
echo.
echo The app will be available at: http://localhost:3001
echo Press Ctrl+C to stop the server.
echo.
node "%~dp0node_modules\..\node_modules\next\dist\bin\next" dev --port 3001
