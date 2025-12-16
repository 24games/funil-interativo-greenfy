/**
 * Servidor Completo para Desenvolvimento Local
 * 
 * Serve tanto o frontend (via Vite) quanto as APIs
 * Tudo em um único servidor na porta 3000
 * 
 * Uso: node server-completo.js
 */

import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer as createViteServer } from 'vite';
import react from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Função para adaptar handler do Vercel para Express
function adaptVercelHandler(handler) {
  return async (req, res) => {
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

// Inicializa o servidor
async function startServer() {
  try {
    // Configura as rotas da API primeiro
    await setupApiRoutes();

    // Cria servidor Vite
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
      plugins: [react()],
      root: __dirname,
    });

    // Usa o middleware do Vite para servir o frontend
    app.use(vite.middlewares);

    app.listen(PORT, () => {
      console.log('');
      console.log('========================================');
      console.log('  🚀 SERVIDOR LOCAL COMPLETO');
      console.log('========================================');
      console.log('');
      console.log(`  ✅ Frontend: http://localhost:${PORT}`);
      console.log(`  ✅ APIs: http://localhost:${PORT}/api/*`);
      console.log('');
      console.log('  Abra http://localhost:' + PORT + ' no navegador!');
      console.log('');
      console.log('  Pressione CTRL+C para parar');
      console.log('');
      console.log('========================================');
      console.log('');
      
      // Tenta abrir o navegador automaticamente
      try {
        const { exec } = await import('child_process');
        const url = `http://localhost:${PORT}`;
        const command = process.platform === 'win32' 
          ? `start ${url}` 
          : process.platform === 'darwin' 
          ? `open ${url}` 
          : `xdg-open ${url}`;
        setTimeout(() => exec(command), 1000);
      } catch (e) {
        // Ignora se não conseguir abrir
      }
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();
