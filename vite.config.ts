
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Configuration for local development with Lovable support
export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost",
    port: 8080,
    fs: {
      // Explicitly set strict file serving policy
      strict: true,
      // Define allowed directories to prevent directory traversal
      allow: [path.resolve(__dirname)],
      // Explicitly deny access to sensitive directories
      deny: ['.git', '.env', 'node_modules/.vite']
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
  // Properly handle Node.js built-ins
  define: {
    // Provide empty implementations for Node.js modules when running in browser
    'process.env': {}
  }
}));
