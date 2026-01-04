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
import { readFileSync } from 'fs';
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
      configFile: join(__dirname, 'vite.config.js'),
      server: { 
        middlewareMode: true,
        hmr: {
          overlay: false // Desabilita overlay de erros para evitar conflitos
        }
      },
      appType: 'spa',
      root: __dirname,
      clearScreen: false,
    });

    // Usa o middleware do Vite para servir o frontend
    app.use(vite.middlewares);

    // Fallback para SPA: todas as rotas não-API retornam index.html processado pelo Vite
    app.use('*', async (req, res, next) => {
      // Ignora rotas de API
      if (req.originalUrl.startsWith('/api')) {
        return next();
      }
      
      try {
        // Lê o index.html real
        const indexHtmlPath = join(__dirname, 'index.html');
        let template = readFileSync(indexHtmlPath, 'utf-8');
        
        // Processa o HTML com o Vite (injeta scripts, etc)
        const html = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        console.error('❌ Erro ao servir HTML:', e);
        // Se der erro, tenta servir o HTML básico
        res.status(200).set({ 'Content-Type': 'text/html' }).end(`
          <!DOCTYPE html>
          <html lang="es-CL">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>24Games - Genera Ingresos Evaluando Patrones</title>
            </head>
            <body>
              <div id="root"></div>
              <script type="module" src="/src/main.jsx"></script>
            </body>
          </html>
        `);
      }
    });

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
      import('child_process').then(({ exec }) => {
        const url = `http://localhost:${PORT}`;
        const command = process.platform === 'win32' 
          ? `start ${url}` 
          : process.platform === 'darwin' 
          ? `open ${url}` 
          : `xdg-open ${url}`;
        setTimeout(() => exec(command), 1000);
      }).catch((e) => {
        // Ignora se não conseguir abrir
        console.log('⚠️ Não foi possível abrir o navegador automaticamente');
      });
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();



