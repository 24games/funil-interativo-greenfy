@echo off
chcp 65001 >nul
echo ========================================
echo   DEPLOY FORCADO - GITHUB
echo ========================================
echo.

echo Forcando adicao de TODOS os arquivos...
git add -A

echo.
echo Status atual:
git status

echo.
echo Fazendo commit forçado...
git commit -m "Deploy: %date% %time%" --allow-empty

echo.
echo Fazendo push forçado...
git push -u origin main --force

echo.
echo ========================================
if errorlevel 1 (
    echo ERRO! Tente novamente ou verifique sua conexao.
) else (
    echo DEPLOY CONCLUIDO COM SUCESSO!
    echo.
    echo Repositorio: https://github.com/24games/funil-interativo-greenfy
)
echo ========================================
echo.
pause

































