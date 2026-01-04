@echo off
echo ========================================
echo   ENVIANDO EVENTO PAGEVIEW DE TESTE
echo ========================================
echo.
echo Pixel ID: 1170692121796734
echo Test Event Code: TEST57030
echo.
echo Enviando evento...
echo.

curl -X POST "https://graph.facebook.com/v18.0/1170692121796734/events" ^
  -H "Content-Type: application/json" ^
  -d "{\"data\":[{\"event_name\":\"PageView\",\"event_time\":%time:~0,2%%time:~3,2%%time:~6,2%,\"event_id\":\"test_pageview_%date:~-4,4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%\",\"event_source_url\":\"https://www.hackermillon.online\",\"action_source\":\"website\",\"user_data\":{\"client_ip_address\":\"192.168.1.100\",\"client_user_agent\":\"Mozilla/5.0\",\"fbp\":\"fb.1.test.1234567890\"},\"custom_data\":{\"content_name\":\"Landing Page - Teste\",\"content_category\":\"landing_page\"}}],\"test_event_code\":\"TEST57030\",\"access_token\":\"EAADG88pNjVUBQJRLLaRpUZCdiUtZBXbxLGZB93LxdMnbV3ejomv3qbWuXu5OGBaH3zbhdqMOz722eZA7zyryFAczJtBBWKuVT9ZBYYUDcEoOF3adcK7CIHcL7yft3MZBU636aURzB16MrSnZByGBNvEmza0Kpzeka71Or87CAPFqL6CZCRw3w7QxST5BVFZANwgZDZD\"}"

echo.
echo.
echo ========================================
echo   EVENTO ENVIADO!
echo ========================================
echo.
echo Verifique no Meta Events Manager:
echo https://business.facebook.com/events_manager2
echo.
echo Selecione o Pixel: 1170692121796734
echo Vá em "Test Events"
echo Procure pelo codigo: TEST57030
echo.
pause



























