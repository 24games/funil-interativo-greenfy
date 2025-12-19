# 🔧 Configurar MCP Server do Supabase no Cursor

## ✅ Instalação Concluída

O pacote `@modelcontextprotocol/server-postgres` já foi instalado no projeto!

## 📋 Passo a Passo para Configurar no Cursor

### 1️⃣ Obter a String de Conexão do Supabase

1. Acesse o painel do seu projeto no [Supabase](https://supabase.com)
2. Vá em **Settings** → **Database**
3. Role até a seção **Connection string**
4. Selecione **Session mode** (não Transaction mode)
5. Copie a string de conexão (formato: `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`)

### 2️⃣ Configurar no Cursor (Interface Gráfica)

1. Abra o Cursor
2. Pressione `Ctrl + ,` (ou vá em **File** → **Preferences** → **Settings**)
3. No campo de busca, digite: **MCP**
4. Clique em **Features** → **MCP**
5. Clique em **+ Add New MCP Server**
6. Preencha os campos:
   - **Name:** `Supabase`
   - **Type:** Selecione `stdio`
   - **Command:** 
     ```
     cmd /c npx -y @modelcontextprotocol/server-postgres <COLE_SUA_STRING_AQUI>
     ```
   - Substitua `<COLE_SUA_STRING_AQUI>` pela string de conexão que você copiou
7. Clique em **Save**

### 3️⃣ Configurar via Arquivo (Alternativa)

Se preferir configurar manualmente via arquivo JSON:

1. Abra o arquivo: `C:\Users\Boi\AppData\Roaming\Cursor\User\settings.json`
2. Adicione a seguinte configuração (substitua `SUA_STRING_DE_CONEXAO`):

```json
{
    "window.commandCenter": true,
    "mcpServers": {
        "supabase": {
            "command": "cmd",
            "args": [
                "/c",
                "npx",
                "-y",
                "@modelcontextprotocol/server-postgres",
                "SUA_STRING_DE_CONEXAO_AQUI"
            ]
        }
    }
}
```

### 4️⃣ Verificar a Conexão

1. Feche e reabra o Cursor
2. Vá em **Settings** → **Features** → **MCP**
3. O servidor "Supabase" deve aparecer na lista
4. Clique no botão de atualização para verificar se as ferramentas estão disponíveis

## 🔐 Segurança

⚠️ **IMPORTANTE:** A string de conexão contém credenciais sensíveis. 

**Opção Segura - Usar Variável de Ambiente:**

1. Crie uma variável de ambiente do Windows chamada `SUPABASE_CONNECTION_STRING`
2. Defina o valor como sua string de conexão
3. No arquivo de configuração, use:

```json
{
    "mcpServers": {
        "supabase": {
            "command": "cmd",
            "args": [
                "/c",
                "npx",
                "-y",
                "@modelcontextprotocol/server-postgres",
                "%SUPABASE_CONNECTION_STRING%"
            ]
        }
    }
}
```

## 🧪 Testar a Conexão

Após configurar, você pode testar pedindo ao Cursor:
- "Liste todas as tabelas do meu banco Supabase"
- "Execute uma query simples no Supabase"
- "Mostre a estrutura da tabela X"

## ❓ Problemas Comuns

**Erro: "Client closed"**
- Solução: Use `cmd /c` antes do comando (já incluído na configuração acima)

**Erro: "Connection refused"**
- Verifique se a string de conexão está correta
- Certifique-se de usar a string do **Session mode**, não Transaction mode

**Servidor não aparece**
- Reinicie o Cursor completamente
- Verifique se o Node.js está instalado (`node -v` no terminal)

## 📚 Recursos

- [Documentação Oficial Supabase MCP](https://supabase.com/mcp)
- [Repositório MCP Server Postgres](https://github.com/modelcontextprotocol/servers/tree/main/src/postgres)


















