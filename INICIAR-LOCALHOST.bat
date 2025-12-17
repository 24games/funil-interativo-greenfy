@echo off
title Servidor Local - Landing Page + APIs
color 0A
mode con: cols=90 lines=35

echo.
echo ============================================
echo    SERVIDOR LOCAL - DESENVOLVIMENTO
echo ============================================
echo.
echo Iniciando servidor completo (Frontend + APIs)...
echo.
echo Aguarde alguns segundos...
echo.
echo Quando aparecer "Frontend: http://localhost:3000"
echo O navegador abrirá automaticamente!
echo Se não abrir, acesse manualmente: http://localhost:3000
echo.
echo ============================================
echo.
echo Pressione CTRL+C para parar o servidor
echo.

cd /d "%~dp0"
npm run dev:local

pause



