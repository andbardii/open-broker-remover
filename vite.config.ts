import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import type { IncomingMessage, ServerResponse } from 'http';

export default defineConfig(({ mode }) => {
  const wsToken = process.env.VITE_WS_TOKEN || "development-ws-token";
  const isProd = mode === 'production';
  
  return {
    server: {
      host: "localhost",
      port: 8080,
      fs: {
        strict: true,
        allow: [path.resolve(__dirname)],
        deny: ['.git', '.env', 'node_modules/.vite']
      },
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 8080,
        clientPort: 8080,
        overlay: true,
        path: `/_hmr?token=${wsToken}`,
      },
      cors: {
        origin: ['http://localhost:8080'],
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'X-Requested-With'],
        credentials: true,
        maxAge: 3600,
        preflightContinue: false,
        optionsSuccessStatus: 204
      },
      middlewares: [
        (req: IncomingMessage, res: ServerResponse, next: () => void) => {
          const clientIp = req.socket.remoteAddress;
          const isLocalhost = clientIp === '127.0.0.1' || clientIp === '::1' || clientIp === '::ffff:127.0.0.1';
          
          if (req.url?.startsWith('/_hmr') && req.headers.upgrade === 'websocket') {
            if (!req.url.includes(`token=${wsToken}`)) {
              console.error('Invalid HMR connection attempt without token');
              res.statusCode = 403;
              res.end('Forbidden');
              return;
            }
          }
          
          if (!isLocalhost && !isProd) {
            console.error(`Blocked request from non-localhost IP: ${clientIp}`);
            res.statusCode = 403;
            res.end('Access denied - development server only accessible from localhost');
            return;
          }
          
          res.setHeader('X-Content-Type-Options', 'nosniff');
          res.setHeader('X-Frame-Options', 'DENY');
          res.setHeader('X-XSS-Protection', '1; mode=block');
          
          next();
        }
      ]
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      target: "esnext",
      minify: false,
      sourcemap: true,
    },
    optimizeDeps: {
      exclude: ['path', 'fs', 'crypto'],
    },
    define: {
      'process.env': {},
      'import.meta.env.VITE_WS_TOKEN': JSON.stringify(wsToken),
    },
    esbuild: {
      supported: {
        'top-level-await': true
      }
    }
  };
});
