@echo off
echo ============================================
echo   TESTE DE SERVER-SIDE TRACKING
echo ============================================
echo.
echo Este script testa se o endpoint de tracking
echo esta funcionando corretamente.
echo.
echo IMPORTANTE: Substitua a URL abaixo pela URL
echo do seu projeto no Vercel!
echo.
echo ============================================
echo.

REM Substitua pela URL do seu projeto no Vercel
set WEBHOOK_URL=https://seu-projeto.vercel.app/api/webhook-purchase

echo Testando: %WEBHOOK_URL%
echo.

curl -X POST %WEBHOOK_URL% ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"teste@exemplo.com\",\"name\":\"Teste Usuario\",\"phone\":\"+56912345678\",\"value\":1000,\"currency\":\"CLP\",\"orderId\":\"TEST-%RANDOM%\"}"

echo.
echo.
echo ============================================
echo Se apareceu "success: true", esta funcionando!
echo ============================================
pause




























