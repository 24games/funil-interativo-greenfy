# Script para fazer push do projeto para GitHub

Write-Host "=== Inicializando Git ===" -ForegroundColor Cyan
git init

Write-Host "`n=== Adicionando arquivos ===" -ForegroundColor Cyan
git add .

Write-Host "`n=== Status do repositório ===" -ForegroundColor Cyan
git status

Write-Host "`n=== Fazendo commit ===" -ForegroundColor Cyan
git commit -m "Initial commit: Landing Page Quiz Funnel 24Games"

Write-Host "`n=== Configurando remote ===" -ForegroundColor Cyan
git remote remove origin 2>$null
git remote add origin https://github.com/24games/funil-interativo-greenfy.git
git remote -v

Write-Host "`n=== Renomeando branch para main ===" -ForegroundColor Cyan
git branch -M main

Write-Host "`n=== Fazendo push para GitHub ===" -ForegroundColor Cyan
git push -u origin main

Write-Host "`n=== Verificando status final ===" -ForegroundColor Cyan
git status

Write-Host "`n=== Processo concluído! ===" -ForegroundColor Green


































