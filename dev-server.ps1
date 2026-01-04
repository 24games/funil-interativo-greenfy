# Script para iniciar servidor de desenvolvimento
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Iniciando Servidor Vite" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Navega para o diretório do projeto
Set-Location $PSScriptRoot

# Inicia o servidor
& "$env:ProgramFiles\nodejs\npm.cmd" run dev




























