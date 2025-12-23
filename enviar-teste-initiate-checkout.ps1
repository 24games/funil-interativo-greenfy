# Script para enviar evento InitiateCheckout de teste via Meta Conversions API
# Código de teste: TEST57030

$META_PIXEL_ID = "1170692121796734"
$META_ACCESS_TOKEN = "EAADG88pNjVUBQJRLLaRpUZCdiUtZBXbxLGZB93LxdMnbV3ejomv3qbWuXu5OGBaH3zbhdqMOz722eZA7zyryFAczJtBBWKuVT9ZBYYUDcEoOF3adcK7CIHcL7yft3MZBU636aURzB16MrSnZByGBNvEmza0Kpzeka71Or87CAPFqL6CZCRw3w7QxST5BVFZANwgZDZD"
$TEST_EVENT_CODE = "TEST57030"

$eventTime = [Math]::Floor([DateTimeOffset]::Now.ToUnixTimeSeconds())
$eventId = "test_initiatecheckout_$(Get-Date -Format 'yyyyMMddHHmmss')"

$eventData = @{
    data = @(
        @{
            event_name = "InitiateCheckout"
            event_time = $eventTime
            event_id = $eventId
            event_source_url = "https://www.hackermillon.online/?step=7"
            action_source = "website"
            user_data = @{
                client_ip_address = "192.168.1.100"
                client_user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                fbp = "fb.1.test.1234567890"
                fbc = "fb.1.test.AbCdEfGhIj"
            }
            custom_data = @{
                content_name = "Checkout - App Liberado"
                content_category = "checkout"
                currency = "CLP"
                value = 0
            }
        }
    )
    test_event_code = $TEST_EVENT_CODE
    access_token = $META_ACCESS_TOKEN
}

$apiUrl = "https://graph.facebook.com/v18.0/$META_PIXEL_ID/events"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ENVIANDO EVENTO INITIATECHECKOUT DE TESTE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pixel ID: $META_PIXEL_ID" -ForegroundColor Yellow
Write-Host "Test Event Code: $TEST_EVENT_CODE" -ForegroundColor Yellow
Write-Host "Event ID: $eventId" -ForegroundColor Yellow
Write-Host "Event Name: InitiateCheckout" -ForegroundColor Yellow
Write-Host ""
Write-Host "Enviando evento..." -ForegroundColor Yellow
Write-Host ""

try {
    $jsonBody = $eventData | ConvertTo-Json -Depth 10
    
    $response = Invoke-RestMethod -Uri $apiUrl -Method POST -Body $jsonBody -ContentType "application/json"
    
    Write-Host "✅ Resposta da API:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10)
    Write-Host ""
    
    if ($response.events_received -eq 1) {
        Write-Host "✅ Evento InitiateCheckout enviado com sucesso!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📱 Verifique no Meta Events Manager:" -ForegroundColor Cyan
        Write-Host "   https://business.facebook.com/events_manager2" -ForegroundColor White
        Write-Host "   → Selecione o Pixel: $META_PIXEL_ID" -ForegroundColor White
        Write-Host "   → Vá em 'Test Events'" -ForegroundColor White
        Write-Host "   → Procure pelo código: $TEST_EVENT_CODE" -ForegroundColor White
        Write-Host "   → Procure pelo evento: InitiateCheckout" -ForegroundColor White
    } else {
        Write-Host "⚠️ Evento pode não ter sido recebido corretamente" -ForegroundColor Yellow
        Write-Host "Events received: $($response.events_received)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Erro ao enviar evento:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Detalhes:" -ForegroundColor Yellow
    Write-Host $_.Exception -ForegroundColor Red
}

Write-Host ""
Write-Host "Pressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")



























