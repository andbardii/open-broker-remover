import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  const wsToken = process.env.VITE_WS_TOKEN || "development-ws-token";
  
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
      },
      cors: {
        origin: 'localhost:8080',
        methods: ['GET', 'POST'],
        credentials: true
      }
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
