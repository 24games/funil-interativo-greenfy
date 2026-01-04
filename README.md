# 🎮 24Games - Landing Page Quiz Funnel

Landing Page interativa estilo Quiz Funnel de alta conversão para o mercado chileno.

## 🚀 Características

- **Design Mobile-First** - Otimizado para telas verticais
- **Dark Mode Elegante** - Tema escuro profundo (#050505) com acentos verde neon (#00FF88)
- **Animações Fluidas** - Transições suaves com Framer Motion
- **7 Etapas de Conversão** - Funil completo desde intro até oferta final
- **Efeitos Visuais** - Background com partículas, glassmorphism, shimmer effects
- **Pronto para Vturb** - Placeholders para integração de vídeos

## 🛠️ Stack Técnica

- **React 18** - Biblioteca JavaScript
- **Vite** - Build tool ultrarrápido
- **Tailwind CSS** - Estilização avançada
- **Framer Motion** - Animações e transições
- **Lucide React** - Ícones modernos

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## 🎯 Estrutura do Funil

### Step 1 - Intro
- Logo centralizada
- Headline com destaque em CLP
- Vídeo placeholder Vturb
- Botão CTA com efeito glow

### Step 2 - Engajamento
- Barra de progresso (20%)
- Pergunta interativa
- 4 opções em cards glassmorphism
- Avança automaticamente ao clicar

### Step 3 - Prova Social
- Barra de progresso (40%)
- Carrossel auto-scroll de depoimentos
- Texto com destaque especial

### Step 4 - A Prova
- Barra de progresso (60%)
- Headline com efeito shimmer no valor
- Vídeo placeholder
- CTA direcionado

### Step 5 - Quiz (3 Perguntas)
- Perguntas sequenciais com transições
- Múltipla escolha
- Feedback visual ao selecionar

### Step 6 - Aprovação
- Tela de "Analizando perfil" (2s)
- Animação de confetes
- "Perfil Aprobado" com efeitos
- Transição automática (3s)

### Step 7 - Oferta Final
- Barra de progresso 100%
- Badge de cupo reservado
- Vídeo final
- Lista de benefícios
- Urgência e escassez
- CTA com animação heartbeat
- Trust badges

## 🎨 Customização

### Cores
Edite `tailwind.config.js` para alterar as cores:
```js
colors: {
  neon: '#00FF88',
  dark: '#050505',
}
```

### Fontes
O projeto usa a fonte **Sora** do Google Fonts. Para alterar, edite `index.html` e `tailwind.config.js`.

### Textos
Todos os textos estão em **Espanhol Chileno** e podem ser editados diretamente nos componentes em `src/components/`.

### Vídeos Vturb
Os placeholders de vídeo são divs com classe `.video-placeholder`. Para integrar o Vturb:

1. Localize os placeholders em Step1, Step4 e Step7
2. Substitua a div pelo iframe do Vturb
3. Mantenha o `aspect-ratio: 9/16` para formato vertical

## 📱 Responsividade

O layout é **mobile-first** e se adapta perfeitamente a:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (limitado a max-w-md centralizado)

## ⚡ Performance

- Lazy loading de componentes
- Animações otimizadas com GPU
- Bundle otimizado com Vite
- Imagens e assets otimizados

## 🔧 Próximos Passos

1. **Integrar Vturb**: Substituir placeholders pelos iframes reais
2. **Adicionar Analytics**: Google Analytics, Facebook Pixel, etc.
3. **Configurar CTA**: Adicionar link do WhatsApp/checkout no Step7
4. **SEO**: Meta tags, Open Graph, Schema.org
5. **Testes A/B**: Testar variações de copy e design

## 📄 Licença

Projeto privado - 24Games © 2025



































