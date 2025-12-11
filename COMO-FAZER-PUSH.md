# 🚀 Como Fazer Push para o GitHub

## Problema: O terminal não está mostrando saída

Vou te ajudar a fazer o push manualmente. Siga estes passos:

## 📋 Passo a Passo

### 1️⃣ Abrir o Terminal na Pasta do Projeto

**Opção A - Pelo Cursor/VS Code:**
- Pressione `Ctrl + '` (aspas simples) para abrir o terminal integrado
- Ou vá em: Terminal → New Terminal

**Opção B - Pelo Explorador do Windows:**
- Abra o Explorador de Arquivos
- Navegue até a pasta do projeto
- Clique com botão direito na pasta
- Selecione "Git Bash Here" (se tiver Git instalado)
- Ou "Abrir no Terminal" / "Open in Terminal"

**Opção C - Pelo Menu Iniciar:**
- Pressione `Win + R`
- Digite `powershell` e pressione Enter
- Digite: `cd "c:\Users\Boi\Desktop\Bet Lead\CURSOR - TODOS PROJETOS\24GAMES\NOV 2025\27 - lp funil renda extra 24games elian"`
- Pressione Enter

### 2️⃣ Executar os Comandos Git

Copie e cole cada comando abaixo, um por vez:

```bash
# 1. Inicializar Git
git init

# 2. Adicionar todos os arquivos
git add .

# 3. Verificar o que será commitado
git status

# 4. Fazer commit
git commit -m "Initial commit: Landing Page Quiz Funnel 24Games"

# 5. Renomear branch para main
git branch -M main

# 6. Adicionar remote (se ainda não foi adicionado)
git remote add origin https://github.com/24games/funil-interativo-greenfy.git

# 7. Verificar remote
git remote -v

# 8. Fazer push
git push -u origin main
```

### 3️⃣ Se Pedir Autenticação

Quando executar `git push`, pode pedir usuário e senha:

**NÃO use sua senha do GitHub!** Use um **Personal Access Token**:

1. Vá em: https://github.com/settings/tokens
2. Clique em "Generate new token" → "Generate new token (classic)"
3. Dê um nome: "Cursor Push"
4. Selecione o escopo: `repo` (marcar tudo dentro de repo)
5. Clique em "Generate token"
6. **COPIE O TOKEN** (você só verá ele uma vez!)
7. Quando o Git pedir senha, cole o token

**OU configure o Git Credential Manager:**

```bash
git config --global credential.helper manager-core
```

Depois tente o push novamente.

### 4️⃣ Verificar se Funcionou

Abra no navegador: https://github.com/24games/funil-interativo-greenfy

Você deve ver todos os arquivos do projeto lá!

## 🔧 Verificar Configuração do Git

Se quiser verificar se o Git está configurado:

```bash
# Ver nome configurado
git config --global user.name

# Ver email configurado
git config --global user.email

# Se não estiver configurado, configure:
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@exemplo.com"
```

## ❓ Problemas Comuns

**Erro: "fatal: not a git repository"**
- Execute `git init` primeiro

**Erro: "remote origin already exists"**
- Execute: `git remote remove origin`
- Depois: `git remote add origin https://github.com/24games/funil-interativo-greenfy.git`

**Erro: "Authentication failed"**
- Use Personal Access Token ao invés de senha
- Ou configure: `git config --global credential.helper manager-core`

**Erro: "Permission denied"**
- Verifique se você tem acesso ao repositório
- Verifique se o token tem permissão `repo`

## 💡 Dica

Se preferir, você pode usar o **GitHub Desktop** (aplicativo gráfico) que é mais fácil para iniciantes!







