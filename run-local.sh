#!/bin/bash
echo "Starting Healthier Consultation System..."

# Backend
cd backend
npm install &
BACKEND_PID=$!
wait $BACKEND_PID
npm run dev &
cd ..

# Wait a bit
sleep 3

# Frontend
cd frontend
npm install &
FRONTEND_PID=$!
wait $FRONTEND_PID
npm run dev &
cd ..

echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:5173"
wait
