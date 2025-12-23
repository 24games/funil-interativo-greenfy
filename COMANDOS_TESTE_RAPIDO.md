# ⚡ Comandos Rápidos para Teste

## 🖥️ Console do Navegador (F12 → Console)

### **Teste Completo (Cole tudo de uma vez):**

```javascript
(async function testTracking() {
  console.log('🧪 TESTE DE TRACKING...\n');
  
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }
  
  const testData = {
    ip: '192.168.1.100',
    user_agent: navigator.userAgent,
    fbp: getCookie('_fbp') || 'fb.1.test.' + Date.now(),
    fbc: getCookie('_fbc') || null,
    page_url: window.location.href,
    referrer: document.referrer || null,
    language: navigator.language,
    utm_source: 'test_console',
    utm_medium: 'manual',
    utm_campaign: 'test_' + Date.now(),
    timestamp: new Date().toISOString()
  };
  
  console.log('📦 Enviando:', testData);
  
  try {
    const response = await fetch('/api/tracking-pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    console.log('✅ Resultado:', result);
  } catch (error) {
    console.log('❌ Erro:', error.message);
  }
})();
```

---

## 💻 Terminal (PowerShell)

### **Teste Local:**
```powershell
curl -X POST http://localhost:5173/api/tracking-pageview -H "Content-Type: application/json" -d '{\"ip\":\"192.168.1.100\",\"user_agent\":\"Mozilla/5.0\",\"page_url\":\"http://localhost:5173\",\"fbp\":\"fb.1.test.123\",\"timestamp\":\"2025-11-27T10:00:00.000Z\"}'
```

### **Teste Produção:**
```powershell
curl -X POST https://seu-dominio.vercel.app/api/tracking-pageview -H "Content-Type: application/json" -d '{\"ip\":\"192.168.1.100\",\"user_agent\":\"Mozilla/5.0\",\"page_url\":\"https://seu-dominio.vercel.app\",\"fbp\":\"fb.1.test.123\",\"timestamp\":\"2025-11-27T10:00:00.000Z\"}'
```

---

## 🗄️ Supabase (MCP Server - Cursor)

### **Ver último registro:**
```sql
SELECT * FROM tracking_SQD_CAS_LP1_VSL_HACKERMILLON
ORDER BY created_at DESC
LIMIT 1;
```

### **Contar registros:**
```sql
SELECT COUNT(*) as total FROM tracking_SQD_CAS_LP1_VSL_HACKERMILLON;
```

### **Ver erros:**
```sql
SELECT event_id, error_message, created_at 
FROM tracking_SQD_CAS_LP1_VSL_HACKERMILLON
WHERE error_message IS NOT NULL
ORDER BY created_at DESC;
```

---

## 📋 Checklist Rápido

1. ✅ Abrir console (F12)
2. ✅ Cole o script acima
3. ✅ Verificar resposta no console
4. ✅ Verificar Network tab
5. ✅ Verificar Supabase

**Pronto!** 🚀



























