@echo off
chcp 65001 >nul
echo ========================================
echo   PUSH PARA GITHUB - DEPLOY MANUAL
echo ========================================
echo.

echo [1/4] Verificando status do Git...
git status --short
if errorlevel 1 (
    echo ERRO: Git nao encontrado ou repositorio nao inicializado!
    pause
    exit /b 1
)

echo.
echo [2/4] Adicionando todos os arquivos modificados...
git add .
if errorlevel 1 (
    echo ERRO ao adicionar arquivos!
    pause
    exit /b 1
)

echo.
echo [3/4] Fazendo commit...
set "commit_msg=Update: %date:~-4,4%-%date:~-7,2%-%date:~-10,2% %time:~0,5%"
git commit -m "%commit_msg%"
if errorlevel 1 (
    echo AVISO: Nenhuma mudanca para commitar ou commit falhou.
    echo Continuando mesmo assim...
)

echo.
echo [4/4] Fazendo push para GitHub...
git push origin main
if errorlevel 1 (
    echo.
    echo ========================================
    echo ERRO no push!
    echo.
    echo Possiveis causas:
    echo - Precisa de autenticacao (use Personal Access Token)
    echo - Problema de conexao
    echo - Branch nao configurada corretamente
    echo.
    echo Tente executar manualmente:
    echo   git push -u origin main
    echo ========================================
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCESSO! Push concluido!
echo.
echo Verifique em:
echo https://github.com/24games/funil-interativo-greenfy
echo ========================================
echo.
pause


