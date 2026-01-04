@echo off
title Servidor Vite - Landing Page
color 0A
mode con: cols=80 lines=25

echo.
echo ============================================
echo    SERVIDOR DE DESENVOLVIMENTO VITE
echo ============================================
echo.
echo Aguarde, iniciando servidor...
echo.
echo Quando aparecer "Local: http://localhost:5173"
echo Abra essa URL no navegador do Cursor!
echo.
echo ============================================
echo.
echo Pressione CTRL+C para parar o servidor
echo.

cd /d "%~dp0"
npm.cmd run dev

pause




























