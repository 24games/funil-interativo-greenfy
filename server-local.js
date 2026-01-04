/**
 * Servidor Local para Desenvolvimento
 * 
 * Adapta as Serverless Functions do Vercel para rodar localmente com Express
 * 
 * Uso: npm run dev:local
 */

import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001; // Porta diferente do Vite

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Função para adaptar handler do Vercel para Express
function adaptVercelHandler(handler) {
  return async (req, res) => {
    // Adapta req e res para o formato do Vercel
    const vercelReq = {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      query: req.query,
    };

    const vercelRes = {
      status: (code) => {
        res.status(code);
        return vercelRes;
      },
      json: (data) => res.json(data),
      send: (data) => res.send(data),
      end: () => res.end(),
      setHeader: (name, value) => res.setHeader(name, value),
    };

    try {
      await handler(vercelReq, vercelRes);
    } catch (error) {
      console.error('Erro no handler:', error);
      res.status(500).json({ error: error.message });
    }
  };
}

// Carrega e registra as rotas da API
async function setupApiRoutes() {
  try {
    // Importa dinamicamente as rotas da API
    const { default: createFlowPayment } = await import('./api/create-flow-payment.js');
    app.post('/api/create-flow-payment', adaptVercelHandler(createFlowPayment));
    app.options('/api/create-flow-payment', (req, res) => res.status(200).end());

    const { default: webhookFlow } = await import('./api/webhook-flow.js');
    app.post('/api/webhook-flow', adaptVercelHandler(webhookFlow));
    app.options('/api/webhook-flow', (req, res) => res.status(200).end());

    const { default: flowReturn } = await import('./api/flow-return.js');
    app.post('/api/flow-return', adaptVercelHandler(flowReturn));
    app.options('/api/flow-return', (req, res) => res.status(200).end());

    const { default: trackingPageview } = await import('./api/tracking-pageview.js');
    app.post('/api/tracking-pageview', adaptVercelHandler(trackingPageview));
    app.options('/api/tracking-pageview', (req, res) => res.status(200).end());

    const { default: trackingInitiateCheckout } = await import('./api/tracking-initiate-checkout.js');
    app.post('/api/tracking-initiate-checkout', adaptVercelHandler(trackingInitiateCheckout));
    app.options('/api/tracking-initiate-checkout', (req, res) => res.status(200).end());

    const { default: webhookPurchase } = await import('./api/webhook-purchase.js');
    app.post('/api/webhook-purchase', adaptVercelHandler(webhookPurchase));
    app.options('/api/webhook-purchase', (req, res) => res.status(200).end());

    const { default: webhookPerfectPay } = await import('./api/webhook-perfectpay.js');
    app.post('/api/webhook-perfectpay', adaptVercelHandler(webhookPerfectPay));
    app.options('/api/webhook-perfectpay', (req, res) => res.status(200).end());

    console.log('✅ Rotas da API carregadas com sucesso');
  } catch (error) {
    console.error('❌ Erro ao carregar rotas da API:', error);
  }
}

// Servir arquivos estáticos do Vite em desenvolvimento
app.use(express.static(join(__dirname, 'public')));

// Proxy para o Vite dev server (se estiver rodando)
app.use('*', async (req, res, next) => {
  // Se não for uma rota de API, tenta servir do Vite
  if (!req.originalUrl.startsWith('/api/')) {
    try {
      // Tenta conectar ao Vite dev server na porta 5173
      const viteResponse = await fetch(`http://localhost:5173${req.originalUrl}`);
      if (viteResponse.ok) {
        const text = await viteResponse.text();
        res.send(text);
        return;
      }
    } catch (e) {
      // Se o Vite não estiver rodando, serve o index.html
      const indexPath = join(__dirname, 'index.html');
      try {
        const html = readFileSync(indexPath, 'utf-8');
        res.send(html);
      } catch (err) {
        res.status(404).send('Arquivo não encontrado');
      }
      return;
    }
  }
  next();
});

// Inicializa o servidor
async function startServer() {
  try {
    // Configura as rotas da API
    await setupApiRoutes();

    app.listen(PORT, () => {
      console.log('');
      console.log('========================================');
      console.log('  🚀 SERVIDOR LOCAL INICIADO');
      console.log('========================================');
      console.log('');
      console.log(`  APIs: http://localhost:${PORT}/api/*`);
      console.log('');
      console.log('  ⚠️  IMPORTANTE:');
      console.log('  Este servidor roda apenas as APIs.');
      console.log('  Para o frontend, inicie o Vite em outro terminal:');
      console.log('  npm run dev');
      console.log('  O Vite estará em http://localhost:5173');
      console.log('  e fará proxy das APIs automaticamente.');
      console.log('');
      console.log('  Pressione CTRL+C para parar');
      console.log('');
      console.log('========================================');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();



