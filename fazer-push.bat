@echo off
echo ========================================
echo   FAZENDO PUSH PARA O GITHUB
echo ========================================
echo.

echo [1/7] Inicializando Git...
git init
if errorlevel 1 (
    echo ERRO: Git nao encontrado! Instale o Git primeiro.
    pause
    exit /b 1
)

echo.
echo [2/7] Adicionando arquivos...
git add .

echo.
echo [3/7] Verificando status...
git status

echo.
echo [4/7] Fazendo commit...
git commit -m "Initial commit: Landing Page Quiz Funnel 24Games"
if errorlevel 1 (
    echo AVISO: Pode ser que nao haja mudancas para commitar.
)

echo.
echo [5/7] Renomeando branch para main...
git branch -M main

echo.
echo [6/7] Configurando remote...
git remote remove origin 2>nul
git remote add origin https://github.com/24games/funil-interativo-greenfy.git

echo.
echo [7/7] Fazendo push para GitHub...
echo.
echo ATENCAO: Se pedir autenticacao, use um Personal Access Token!
echo Nao use sua senha do GitHub!
echo.
git push -u origin main

echo.
echo ========================================
if errorlevel 1 (
    echo ERRO no push! Verifique as mensagens acima.
    echo.
    echo Possiveis causas:
    echo - Precisa de autenticacao (use Personal Access Token)
    echo - Repositorio nao existe ou sem permissao
    echo - Problema de conexao
) else (
    echo SUCESSO! Verifique em:
    echo https://github.com/24games/funil-interativo-greenfy
)
echo ========================================
echo.
pause


































