@echo off
:: Force the command prompt to start in the exact folder where this file lives
cd /d "%~dp0"

echo Starting CoreFitness Backend Engine (Port 5000)...
start "CoreFitness Backend" cmd /k "cd server && npm run dev"

echo Starting CoreFitness Frontend UI (Port 5173)...
start "CoreFitness Frontend" cmd /k "npm run dev"

echo Both systems have been successfully deployed using Windows CMD!
echo You can now close this main window.
pause
