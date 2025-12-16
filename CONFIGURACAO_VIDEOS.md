# 🎥 Configuração de Vídeos Vturb - Controle de Botões

## 📋 Como Funciona

Os botões dos Steps 1, 4 e 7 só aparecem quando o lead assiste uma determinada porcentagem do vídeo. Isso garante que o lead veja o conteúdo antes de avançar.

## ⚙️ Como Ajustar a Porcentagem

### Step 1 (Primeiro Vídeo)
Abra `src/components/Step1.jsx` e encontre:

```javascript
const requiredProgress = 50 // Porcentagem do vídeo que precisa ser assistida
```

**Exemplos:**
- `50` = Botão aparece quando o vídeo chega em 50%
- `75` = Botão aparece quando o vídeo chega em 75%
- `100` = Botão aparece apenas quando o vídeo termina

### Step 4 (Segundo Vídeo)
Abra `src/components/Step4.jsx` e encontre:

```javascript
const requiredProgress = 50
```

### Step 7 (Terceiro Vídeo - Oferta Final)
Abra `src/components/Step7.jsx` e encontre:

```javascript
const requiredProgress = 50
```

## 🎯 Recomendações

- **Step 1 (Intro)**: 30-50% - Deixe o lead ver a proposta de valor
- **Step 4 (Prova)**: 50-70% - Garanta que veja a demonstração
- **Step 7 (Oferta)**: 60-80% - Importante que veja a oferta completa antes de comprar

## 🔧 Ajuste por Tempo (Alternativa)

Se preferir controlar por tempo ao invés de porcentagem, você pode modificar o `handleVideoProgress`:

```javascript
const handleVideoProgress = ({ currentTime, duration }) => {
  // Exemplo: Botão aparece após 30 segundos
  const requiredTime = 30 // segundos
  if (currentTime >= requiredTime && !showButton) {
    setShowButton(true)
  }
}
```

## 📊 Monitoramento

O componente `VturbVideo` envia informações de progresso:
- `currentTime`: Tempo atual do vídeo (em segundos)
- `duration`: Duração total do vídeo (em segundos)
- `progress`: Porcentagem assistida (0-100)

## ⚠️ Nota Importante

Se o vídeo não carregar ou houver problemas de detecção, o botão pode não aparecer. Nesse caso, você pode adicionar um fallback:

```javascript
// Fallback: Mostra botão após 10 segundos mesmo sem detectar o vídeo
useEffect(() => {
  const fallbackTimer = setTimeout(() => {
    if (!showButton) {
      setShowButton(true)
    }
  }, 10000) // 10 segundos

  return () => clearTimeout(fallbackTimer)
}, [showButton])
```















