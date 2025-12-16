# 🚀 Como Rodar o Projeto Localmente

## Início Rápido

### Opção 1: Script Automático (Recomendado)
```bash
# Windows
INICIAR-LOCALHOST.bat

# Ou via npm
npm run dev:local
```

### Opção 2: Servidores Separados
```bash
# Terminal 1 - APIs
npm run dev:api

# Terminal 2 - Frontend
npm run dev
```

## URLs de Acesso

- **Frontend**: http://localhost:3000
- **APIs**: http://localhost:3001/api/*

## O que acontece?

Quando você roda `npm run dev:local`:

1. **Servidor Express** (porta 3001) - Roda as APIs
2. **Servidor Vite** (porta 3000) - Roda o frontend React
3. O Vite faz proxy automático das APIs

## Solução de Problemas

### Nada aparece no navegador?

1. Verifique se ambos os servidores estão rodando:
   - Você deve ver mensagens de ambos no terminal
   - API na porta 3001
   - Frontend na porta 3000

2. Acesse a URL correta:
   - **http://localhost:3000** (não 3001!)

3. Verifique o console do navegador (F12) para erros

4. Verifique se a porta 3000 não está em uso:
   ```bash
   netstat -ano | findstr :3000
   ```

### Erro de porta em uso?

Altere a porta no `vite.config.js`:
```js
server: {
  port: 3001, // ou outra porta disponível
}
```

### APIs não funcionam?

1. Verifique se o servidor Express está rodando (porta 3001)
2. Verifique as variáveis de ambiente (`.env`)
3. Veja os logs no terminal do servidor Express

## Estrutura

- `server-local.js` - Servidor Express que adapta as APIs do Vercel
- `vite.config.js` - Configuração do Vite com proxy para APIs
- `INICIAR-LOCALHOST.bat` - Script para Windows
