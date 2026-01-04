# 🔍 Verificar Código de Teste no Meta Events Manager

## ⚠️ IMPORTANTE: Verificações Necessárias

### 1. **Verificar se o Código de Teste está ATIVO**

1. Acesse: https://business.facebook.com/events_manager2
2. Selecione o Pixel: **1170692121796734**
3. No menu lateral, clique em **"Test Events"**
4. Procure por **"Test Event Code"** ou **"Código de Teste"**
5. Verifique se o código **TEST57030** está listado e **ATIVO**

### 2. **Se o código NÃO estiver ativo:**

1. Vá em **"Test Events"** → **"Settings"** ou **"Configurações"**
2. Clique em **"Add Test Event Code"** ou **"Adicionar Código de Teste"**
3. Digite: **TEST57030**
4. Salve e aguarde alguns segundos

### 3. **Verificar se está na conta correta:**

- Certifique-se de estar logado na conta do Facebook Business que possui acesso ao Pixel
- Verifique se você tem permissões de administrador ou editor no Pixel

### 4. **Tempo de processamento:**

- Eventos de teste podem levar **10-30 segundos** para aparecer
- Às vezes pode levar até **1-2 minutos**
- **Aguarde** antes de tentar novamente

---

## 🧪 Script de Diagnóstico

Execute este código no console para verificar o que está acontecendo:

```javascript
// Cole o conteúdo do arquivo diagnostico-purchase-test.js aqui
```

---

## 📋 Checklist de Troubleshooting

- [ ] Código de teste TEST57030 está ativo no Events Manager?
- [ ] Está logado na conta correta do Facebook Business?
- [ ] Tem permissões no Pixel 1170692121796734?
- [ ] Aguardou pelo menos 30 segundos após enviar?
- [ ] Verificou a aba "Test Events" (não "Events" normal)?
- [ ] O console mostra "events_received: 1"?
- [ ] Não há erros no console do navegador?

---

## 🔧 Soluções Comuns

### Problema: "events_received: 0"
**Solução:** O código de teste pode não estar ativo. Ative no Events Manager.

### Problema: Erro 190 (Access Token)
**Solução:** O Access Token pode ter expirado. Gere um novo.

### Problema: Erro 2388099 (Test Event Code)
**Solução:** O código de teste não está ativo ou é inválido.

### Problema: Evento não aparece mesmo com "events_received: 1"
**Solução:** 
- Aguarde mais tempo (até 2 minutos)
- Verifique se está na aba "Test Events" (não "Events")
- Recarregue a página do Events Manager
- Verifique se o código de teste está correto

---

**Execute o script de diagnóstico para ver detalhes completos!**



























