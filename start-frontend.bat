@echo off
title Fixora Frontend Server
cd /d "%~dp0client"
echo ========================================================
echo Starting Fixora Frontend Development Server...
echo URL: http://localhost:5173/
echo ========================================================
start http://localhost:5173/
npm run dev
pause
