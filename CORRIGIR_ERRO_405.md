# 🔧 Como Corrigir o Erro 405

## ❌ Problema
```
POST https://www.hackermillon.online/api/tracking-pageview 405 (Method Not Allowed)
```

## ✅ Soluções

### **Solução 1: Fazer Novo Deploy (RECOMENDADO)**

O erro 405 geralmente acontece quando:
1. O arquivo foi criado mas não foi feito deploy
2. O Vercel não reconheceu a nova rota

**Passos:**
```bash
# 1. Fazer commit das mudanças
git add .
git commit -m "fix: corrige rota tracking-pageview"
git push

# 2. Aguardar deploy automático no Vercel
# 3. Verificar se o deploy foi concluído
```

### **Solução 2: Verificar se a Rota Está Funcionando**

Teste diretamente no navegador:
```
https://www.hackermillon.online/api/tracking-pageview
```

Se retornar JSON (mesmo que erro), a rota está funcionando.
Se retornar HTML ou 404, precisa fazer deploy.

### **Solução 3: Usar Rota Alternativa Temporária**

Enquanto o deploy não acontece, você pode testar localmente:

```javascript
// No console do navegador, use a URL completa:
const response = await fetch('https://www.hackermillon.online/api/tracking-pageview', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    ip: '192.168.1.100',
    user_agent: navigator.userAgent,
    page_url: window.location.href,
    timestamp: new Date().toISOString()
  })
});

const result = await response.json();
console.log(result);
```

### **Solução 4: Verificar Logs do Vercel**

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá em "Deployments" → Último deploy → "Functions"
4. Verifique se `api/tracking-pageview.js` aparece na lista
5. Clique para ver logs de erro

### **Solução 5: Verificar Estrutura de Arquivos**

Certifique-se de que o arquivo está em:
```
projeto/
  api/
    tracking-pageview.js  ← Deve estar aqui
    webhook-purchase.js
  vercel.json
```

---

## 🧪 Teste Rápido Após Deploy

Cole no console do navegador:

```javascript
fetch('https://www.hackermillon.online/api/tracking-pageview', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ip: '192.168.1.100',
    user_agent: navigator.userAgent,
    page_url: window.location.href,
    timestamp: new Date().toISOString()
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

**Se funcionar:** Você verá `{ success: true, ... }`  
**Se não funcionar:** Ainda retornará 405 (precisa fazer deploy)

---

## 📋 Checklist

- [ ] Arquivo `api/tracking-pageview.js` existe
- [ ] `vercel.json` tem a rota configurada
- [ ] Mudanças foram commitadas
- [ ] Push foi feito para o repositório
- [ ] Deploy no Vercel foi concluído
- [ ] Teste no console retorna sucesso

---

## 🚀 Próximos Passos

1. **Fazer commit e push:**
   ```bash
   git add .
   git commit -m "fix: adiciona tracking-pageview API"
   git push
   ```

2. **Aguardar deploy no Vercel** (geralmente 1-2 minutos)

3. **Testar novamente** com o script do console

4. **Se ainda não funcionar:** Verificar logs do Vercel e estrutura de arquivos



























