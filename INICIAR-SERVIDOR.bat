@echo off
title Servidor de Desenvolvimento - Landing Page
color 0A
echo.
echo ============================================
echo   SERVIDOR DE DESENVOLVIMENTO - VITE
echo ============================================
echo.
echo Iniciando servidor...
echo.
echo Aguarde alguns segundos...
echo.
echo Quando aparecer "Local: http://localhost:5173"
echo Abra essa URL no seu navegador!
echo.
echo ============================================
echo.

cd /d "%~dp0"
call npm.cmd run dev

pause




























