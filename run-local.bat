@echo off
echo Starting Healthier Consultation System...
start cmd /k "cd backend && npm install && npm run dev"
timeout /t 5
start cmd /k "cd frontend && npm install && npm run dev"
echo Both servers starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
pause
