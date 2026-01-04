# Script para enviar evento Purchase de teste AGORA
# Código de teste: TEST57030

$META_PIXEL_ID = "1170692121796734"
$META_ACCESS_TOKEN = "EAADG88pNjVUBQJRLLaRpUZCdiUtZBXbxLGZB93LxdMnbV3ejomv3qbWuXu5OGBaH3zbhdqMOz722eZA7zyryFAczJtBBWKuVT9ZBYYUDcEoOF3adcK7CIHcL7yft3MZBU636aURzB16MrSnZByGBNvEmza0Kpzeka71Or87CAPFqL6CZCRw3w7QxST5BVFZANwgZDZD"
$TEST_EVENT_CODE = "TEST57030"

$eventTime = [Math]::Floor([DateTimeOffset]::Now.ToUnixTimeSeconds())
$eventId = "test_purchase_$(Get-Date -Format 'yyyyMMddHHmmss')"
$orderId = "TEST_ORDER_$(Get-Date -Format 'yyyyMMddHHmmss')"

# Hashes SHA-256 (gerados previamente)
$hashedEmail = "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"  # teste@example.com
$hashedPhone = "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"  # 5511999999999

$eventData = @{
    data = @(
        @{
            event_name = "Purchase"
            event_time = $eventTime
            event_id = $eventId
            event_source_url = "https://go.centerpag.com/PPU38CQ4BNQ"
            action_source = "website"
            user_data = @{
                client_ip_address = "192.168.1.100"
                client_user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                fbp = "fb.1.test.1234567890"
                em = $hashedEmail
                ph = $hashedPhone
            }
            custom_data = @{
                currency = "BRL"
                value = 39.9
                content_type = "product"
                content_ids = @($orderId)
                content_name = "HM I.A."
                order_id = $orderId
                num_items = 1
            }
        }
    )
    test_event_code = $TEST_EVENT_CODE
    access_token = $META_ACCESS_TOKEN
}

$apiUrl = "https://graph.facebook.com/v18.0/$META_PIXEL_ID/events"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ENVIANDO EVENTO PURCHASE DE TESTE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pixel ID: $META_PIXEL_ID" -ForegroundColor Yellow
Write-Host "Test Event Code: $TEST_EVENT_CODE" -ForegroundColor Yellow
Write-Host "Event ID: $eventId" -ForegroundColor Yellow
Write-Host "Order ID: $orderId" -ForegroundColor Yellow
Write-Host "Event Time: $eventTime" -ForegroundColor Yellow
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
        Write-Host "✅✅✅ EVENTO ENVIADO COM SUCESSO!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📱 Verifique no Meta Events Manager:" -ForegroundColor Cyan
        Write-Host "   https://business.facebook.com/events_manager2" -ForegroundColor White
        Write-Host "   → Selecione o Pixel: $META_PIXEL_ID" -ForegroundColor White
        Write-Host "   → Vá em 'Test Events'" -ForegroundColor White
        Write-Host "   → Procure pelo código: $TEST_EVENT_CODE" -ForegroundColor White
        Write-Host "   → Procure pelo evento: Purchase" -ForegroundColor White
        Write-Host ""
        Write-Host "⏱️ Aguarde 10-30 segundos para o evento aparecer" -ForegroundColor Yellow
    } else {
        Write-Host "⚠️ Resposta inesperada:" -ForegroundColor Yellow
        Write-Host "Events received: $($response.events_received)" -ForegroundColor Yellow
        if ($response.error) {
            Write-Host "Erro: $($response.error | ConvertTo-Json)" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "❌ Erro ao enviar evento:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    if ($_.ErrorDetails.Message) {
        Write-Host "Detalhes:" -ForegroundColor Yellow
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
}

Write-Host ""

