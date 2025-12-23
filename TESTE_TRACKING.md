# 🧪 Guia de Testes - Sistema de Tracking

## 📋 Comandos para Testar

### **1. Teste no Console do Navegador (Cliente-Side)**

Abra o console do navegador (F12 → Console) e execute:

#### **A) Verificar se o tracking foi inicializado:**
```javascript
// Verificar se o Meta Pixel foi carregado
console.log('Meta Pixel:', window.fbq);

// Verificar dados de tracking capturados
import { getTrackingData } from './utils/tracking.js';
getTrackingData();
```

#### **B) Testar captura manual de dados:**
```javascript
// Capturar dados manualmente
async function testCapture() {
  const { captureTrackingData } = await import('./src/utils/tracking.js');
  const data = await captureTrackingData();
  console.log('Dados capturados:', data);
  return data;
}
testCapture();
```

#### **C) Enviar dados manualmente para API:**
```javascript
// Enviar dados de teste para a API
async function testSendTracking() {
  const testData = {
    ip: '192.168.1.100',
    user_agent: navigator.userAgent,
    fbp: 'fb.1.1234567890.1234567890',
    fbc: null,
    page_url: window.location.href,
    referrer: document.referrer,
    language: navigator.language,
    utm_source: 'test',
    utm_medium: 'console',
    utm_campaign: 'manual_test',
    timestamp: new Date().toISOString()
  };
  
  const response = await fetch('/api/tracking-pageview', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(testData),
  });
  
  const result = await response.json();
  console.log('Resposta da API:', result);
  return result;
}
testSendTracking();
```

#### **D) Testar updateTracking (dados adicionais):**
```javascript
// Simular coleta de dados adicionais
async function testUpdateTracking() {
  const { updateTracking } = await import('./src/utils/tracking.js');
  await updateTracking({
    email: 'teste@example.com',
    phone: '+5511999999999',
    first_name: 'João',
    last_name: 'Silva',
    city: 'São Paulo',
    state: 'SP',
    country: 'BR'
  });
}
testUpdateTracking();
```

---

### **2. Teste via Terminal (API Diretamente)**

#### **A) Teste Local (se estiver rodando npm run dev):**
```bash
curl -X POST http://localhost:5173/api/tracking-pageview ^
  -H "Content-Type: application/json" ^
  -d "{\"ip\":\"192.168.1.100\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36\",\"page_url\":\"http://localhost:5173\",\"fbp\":\"fb.1.1234567890.1234567890\",\"timestamp\":\"2025-11-27T10:00:00.000Z\"}"
```

#### **B) Teste em Produção (após deploy no Vercel):**
```bash
curl -X POST https://seu-dominio.vercel.app/api/tracking-pageview ^
  -H "Content-Type: application/json" ^
  -d "{\"ip\":\"192.168.1.100\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36\",\"page_url\":\"https://seu-dominio.vercel.app\",\"fbp\":\"fb.1.1234567890.1234567890\",\"utm_source\":\"test\",\"utm_campaign\":\"manual\",\"timestamp\":\"2025-11-27T10:00:00.000Z\"}"
```

#### **C) Teste Completo com Todos os Parâmetros:**
```bash
curl -X POST http://localhost:5173/api/tracking-pageview ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"teste@example.com\",\"phone\":\"+5511999999999\",\"ip\":\"192.168.1.100\",\"user_agent\":\"Mozilla/5.0\",\"fbp\":\"fb.1.1234567890.1234567890\",\"fbc\":\"fb.1.1234567890.AbCdEf\",\"first_name\":\"João\",\"last_name\":\"Silva\",\"city\":\"São Paulo\",\"state\":\"SP\",\"country\":\"BR\",\"zip_code\":\"01310-100\",\"utm_source\":\"facebook\",\"utm_medium\":\"cpc\",\"utm_campaign\":\"test_campaign\",\"utm_term\":\"test\",\"utm_content\":\"ad1\",\"fbclid\":\"IwAR123456\",\"page_url\":\"http://localhost:5173\",\"referrer\":\"https://google.com\",\"language\":\"pt-BR\",\"timestamp\":\"2025-11-27T10:00:00.000Z\"}"
```

---

### **3. Teste no Supabase (Verificar Dados Salvos)**

#### **A) Via MCP Server (Cursor):**
```sql
-- Ver últimos 10 registros
SELECT 
  id,
  email,
  phone,
  ip,
  fbp,
  fbc,
  page_url,
  utm_source,
  utm_campaign,
  event_id,
  sent_to_meta,
  created_at
FROM tracking_SQD_CAS_LP1_VSL_HACKERMILLON
ORDER BY created_at DESC
LIMIT 10;
```

#### **B) Verificar um registro específico:**
```sql
-- Buscar por event_id
SELECT * FROM tracking_SQD_CAS_LP1_VSL_HACKERMILLON
WHERE event_id = 'pageview_1732704000000_abc123';
```

#### **C) Verificar se Meta CAPI foi enviado:**
```sql
-- Ver registros enviados para Meta
SELECT 
  event_id,
  email,
  sent_to_meta,
  meta_response,
  error_message,
  created_at
FROM tracking_SQD_CAS_LP1_VSL_HACKERMILLON
WHERE sent_to_meta = true
ORDER BY created_at DESC
LIMIT 10;
```

#### **D) Verificar erros:**
```sql
-- Ver registros com erro
SELECT 
  event_id,
  error_message,
  sent_to_meta,
  created_at
FROM tracking_SQD_CAS_LP1_VSL_HACKERMILLON
WHERE error_message IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;
```

---

### **4. Teste Completo - Fluxo End-to-End**

#### **Passo 1: Abrir a landing page**
```
1. Acesse: http://localhost:5173 (ou URL de produção)
2. Abra o Console do navegador (F12)
```

#### **Passo 2: Verificar logs no console**
```javascript
// Deve aparecer automaticamente:
// "Meta Pixel inicializado: 1170692121796734"
// "Tracking enviado com sucesso: {...}"
// "Tracking inicializado com sucesso"
```

#### **Passo 3: Verificar Network Tab**
```
1. Abra DevTools → Network
2. Filtre por "tracking-pageview"
3. Verifique a requisição POST
4. Clique na requisição → Response
5. Deve retornar: { success: true, data: {...} }
```

#### **Passo 4: Verificar no Supabase**
```sql
-- Execute no MCP Server
SELECT COUNT(*) as total_registros 
FROM tracking_SQD_CAS_LP1_VSL_HACKERMILLON;
```

#### **Passo 5: Verificar Meta Events Manager**
```
1. Acesse: https://business.facebook.com/events_manager2
2. Selecione seu Pixel (1170692121796734)
3. Vá em "Test Events"
4. Deve aparecer eventos PageView
```

---

### **5. Script de Teste Automatizado (Console)**

Cole este script completo no console do navegador:

```javascript
// ============================================
// SCRIPT DE TESTE COMPLETO
// ============================================

(async function testTrackingComplete() {
  console.log('🧪 Iniciando testes de tracking...\n');
  
  // Teste 1: Verificar Meta Pixel
  console.log('1️⃣ Verificando Meta Pixel...');
  if (window.fbq) {
    console.log('✅ Meta Pixel carregado:', window.fbq);
  } else {
    console.log('❌ Meta Pixel não encontrado');
  }
  
  // Teste 2: Capturar dados
  console.log('\n2️⃣ Capturando dados de tracking...');
  try {
    const { captureTrackingData } = await import('./src/utils/tracking.js');
    const data = await captureTrackingData();
    console.log('✅ Dados capturados:', data);
  } catch (error) {
    console.log('❌ Erro ao capturar:', error.message);
  }
  
  // Teste 3: Enviar para API
  console.log('\n3️⃣ Enviando dados para API...');
  const testData = {
    ip: '192.168.1.100',
    user_agent: navigator.userAgent,
    fbp: getCookie('_fbp') || 'fb.1.test.1234567890',
    fbc: getCookie('_fbc') || null,
    page_url: window.location.href,
    referrer: document.referrer,
    language: navigator.language,
    utm_source: 'test_console',
    utm_medium: 'manual',
    utm_campaign: 'test_tracking',
    timestamp: new Date().toISOString()
  };
  
  try {
    const response = await fetch('/api/tracking-pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    if (result.success) {
      console.log('✅ API respondeu com sucesso:', result);
      console.log('📊 Event ID:', result.data.event_id);
      console.log('💾 Supabase:', result.data.supabase.saved ? 'Salvo' : 'Erro');
      console.log('📱 Meta CAPI:', result.data.meta.sent ? 'Enviado' : 'Erro');
    } else {
      console.log('❌ API retornou erro:', result);
    }
  } catch (error) {
    console.log('❌ Erro ao enviar:', error.message);
  }
  
  // Teste 4: Verificar cookies
  console.log('\n4️⃣ Verificando cookies do Facebook...');
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }
  console.log('_fbp:', getCookie('_fbp') || 'Não encontrado');
  console.log('_fbc:', getCookie('_fbc') || 'Não encontrado');
  
  console.log('\n✅ Testes concluídos!');
})();
```

---

### **6. Comandos PowerShell para Teste (Terminal)**

#### **Criar arquivo de teste:**
```powershell
# Criar arquivo test-tracking.json
@{
  ip = "192.168.1.100"
  user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
  page_url = "http://localhost:5173"
  fbp = "fb.1.1234567890.1234567890"
  utm_source = "test"
  utm_campaign = "manual_test"
  timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
} | ConvertTo-Json | Out-File -FilePath test-tracking.json -Encoding utf8
```

#### **Enviar teste:**
```powershell
# Enviar requisição
$body = Get-Content test-tracking.json -Raw
Invoke-RestMethod -Uri "http://localhost:5173/api/tracking-pageview" -Method POST -Body $body -ContentType "application/json"
```

---

## ✅ Checklist de Testes

- [ ] Meta Pixel inicializado no console
- [ ] Dados capturados automaticamente
- [ ] Requisição POST aparece no Network tab
- [ ] API retorna `{ success: true }`
- [ ] Dados aparecem no Supabase
- [ ] Eventos aparecem no Meta Events Manager
- [ ] Cookies _fbp e _fbc são capturados
- [ ] UTMs são capturados da URL
- [ ] updateTracking() funciona com dados adicionais

---

## 🐛 Troubleshooting

### **Erro: "Cannot find module './src/utils/tracking.js'"**
**Solução:** Use o caminho correto ou importe diretamente:
```javascript
// Em vez de import, use fetch direto
fetch('/api/tracking-pageview', {...})
```

### **Erro: "Network request failed"**
**Solução:** Verifique se o servidor está rodando:
```bash
npm run dev
```

### **Erro: "405 Method Not Allowed"**
**Solução:** Verifique se está usando POST:
```javascript
method: 'POST'  // Não GET
```

### **Dados não aparecem no Supabase**
**Solução:** 
1. Verifique variáveis de ambiente no Vercel
2. Verifique logs do Vercel
3. Execute query SQL para verificar tabela

---

**Pronto para testar!** 🚀



























