# Script para Configurar MCP Server do Supabase no Cursor
# Execute este script como Administrador se necessário

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CONFIGURAR MCP SERVER SUPABASE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se Node.js está instalado
Write-Host "Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node -v
    Write-Host "✓ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js não encontrado!" -ForegroundColor Red
    Write-Host "  Por favor, instale o Node.js de https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Verificar se o pacote está instalado
Write-Host "Verificando pacote MCP..." -ForegroundColor Yellow
if (Test-Path "node_modules\@modelcontextprotocol\server-postgres") {
    Write-Host "✓ Pacote MCP já instalado" -ForegroundColor Green
} else {
    Write-Host "Instalando pacote MCP..." -ForegroundColor Yellow
    cmd /c npm install --save-dev @modelcontextprotocol/server-postgres
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Pacote instalado com sucesso" -ForegroundColor Green
    } else {
        Write-Host "✗ Erro ao instalar pacote" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# Solicitar string de conexão
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CONFIGURAÇÃO DA STRING DE CONEXÃO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para obter sua string de conexão:" -ForegroundColor Yellow
Write-Host "1. Acesse: https://supabase.com" -ForegroundColor White
Write-Host "2. Vá em Settings > Database" -ForegroundColor White
Write-Host "3. Copie a Connection string (Session mode)" -ForegroundColor White
Write-Host ""
Write-Host "Formato esperado:" -ForegroundColor Yellow
Write-Host "postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres" -ForegroundColor Gray
Write-Host ""

$connectionString = Read-Host "Cole sua string de conexão do Supabase"

if ([string]::IsNullOrWhiteSpace($connectionString)) {
    Write-Host "✗ String de conexão não fornecida!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Caminho do arquivo de configuração do Cursor
$cursorSettingsPath = "$env:APPDATA\Cursor\User\settings.json"

Write-Host "Configurando arquivo do Cursor..." -ForegroundColor Yellow
Write-Host "Caminho: $cursorSettingsPath" -ForegroundColor Gray

# Ler configuração atual
$settings = @{}
if (Test-Path $cursorSettingsPath) {
    try {
        $settingsContent = Get-Content $cursorSettingsPath -Raw | ConvertFrom-Json
        $settings = $settingsContent | ConvertTo-Json -Depth 10 | ConvertFrom-Json
    } catch {
        Write-Host "⚠ Arquivo de configuração inválido, criando novo..." -ForegroundColor Yellow
        $settings = @{}
    }
} else {
    Write-Host "⚠ Arquivo de configuração não encontrado, criando novo..." -ForegroundColor Yellow
}

# Adicionar configuração do MCP
if (-not $settings.mcpServers) {
    $settings | Add-Member -MemberType NoteProperty -Name "mcpServers" -Value @{}
}

$settings.mcpServers.supabase = @{
    command = "cmd"
    args = @(
        "/c",
        "npx",
        "-y",
        "@modelcontextprotocol/server-postgres",
        $connectionString
    )
}

# Garantir que window.commandCenter existe
if (-not $settings.'window.commandCenter') {
    $settings | Add-Member -MemberType NoteProperty -Name "window.commandCenter" -Value $true
}

# Salvar configuração
try {
    # Criar diretório se não existir
    $settingsDir = Split-Path $cursorSettingsPath -Parent
    if (-not (Test-Path $settingsDir)) {
        New-Item -ItemType Directory -Path $settingsDir -Force | Out-Null
    }

    # Converter para JSON e salvar
    $jsonContent = $settings | ConvertTo-Json -Depth 10
    $jsonContent | Set-Content $cursorSettingsPath -Encoding UTF8
    
    Write-Host "✓ Configuração salva com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "✗ Erro ao salvar configuração: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CONFIGURAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Feche e reabra o Cursor completamente" -ForegroundColor White
Write-Host "2. Vá em Settings > Features > MCP" -ForegroundColor White
Write-Host "3. Verifique se o servidor 'Supabase' aparece na lista" -ForegroundColor White
Write-Host "4. Clique no botão de atualização para verificar as ferramentas" -ForegroundColor White
Write-Host ""
Write-Host "Para testar, peça ao Cursor:" -ForegroundColor Yellow
Write-Host "  'Liste todas as tabelas do meu banco Supabase'" -ForegroundColor Gray
Write-Host ""

# Perguntar se quer abrir o arquivo de configuração
$openFile = Read-Host "Deseja abrir o arquivo de configuração para revisar? (S/N)"
if ($openFile -eq "S" -or $openFile -eq "s") {
    notepad $cursorSettingsPath
}

Write-Host ""
Write-Host "Pressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")



























