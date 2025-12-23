@echo off
echo ========================================
echo   CONFIGURANDO GIT PARA FACILITAR PUSHES
echo ========================================
echo.

echo Configurando Git Credential Manager...
git config --global credential.helper manager-core

echo.
echo Configurando para salvar credenciais...
git config --global credential.https://github.com.helper manager-core

echo.
echo ========================================
echo CONFIGURACAO CONCLUIDA!
echo.
echo Agora o Git vai salvar suas credenciais
echo e voce nao precisara digitar o token
echo toda vez que fizer push!
echo ========================================
echo.
pause


































