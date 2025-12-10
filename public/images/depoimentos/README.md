# 📸 Imagens de Depoimentos

Esta pasta contém as imagens que serão exibidas no carrossel de depoimentos (Step 3 - Prova Social).

## 📋 Especificações Recomendadas

- **Formato**: JPG ou PNG
- **Dimensões**: 256px × 384px (ou proporção 2:3 vertical)
- **Tamanho**: Máximo 500KB por imagem (otimize antes de adicionar)
- **Orientação**: Vertical (portrait) - formato de celular
- **Qualidade**: Boa resolução para não ficar pixelado

## 📝 Como Usar

### Passo 1: Adicionar Imagens
1. Adicione suas imagens de depoimentos nesta pasta
2. Nomeie os arquivos de forma descritiva:
   - `depoimento-1.jpg`
   - `depoimento-2.jpg`
   - `depoimento-3.jpg`
   - etc.

### Passo 2: Atualizar o Código
1. Abra o arquivo `src/components/Step3.jsx`
2. Encontre a linha com `testimonialImageFiles`
3. Descomente e adicione os nomes dos seus arquivos:

```javascript
const testimonialImageFiles = [
  'depoimento-1.jpg',
  'depoimento-2.jpg',
  'depoimento-3.jpg',
]
```

### Passo 3: Testar
- Execute `npm run dev`
- Navegue até o Step 3 do funil
- Verifique se as imagens aparecem corretamente

## 💡 Dicas

- **Quantidade**: Recomendado 3-5 imagens para o carrossel
- **Conteúdo**: Use prints de WhatsApp, depoimentos reais, feedbacks
- **Formato**: Mantenha todas as imagens no mesmo formato (vertical)
- **Otimização**: Comprima as imagens antes de adicionar para melhor performance

## 🔄 Fallback

Se não houver imagens configuradas, o sistema mostrará placeholders automáticos com gradientes verdes.

