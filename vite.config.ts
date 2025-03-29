import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Configurazione Vite per esecuzione locale con supporto Lovable
export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost",  // Accesso solo locale
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),  // Plugin Lovable solo in sviluppo
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "esnext",
    minify: false,  // Disabilita la minificazione per il debug locale
    sourcemap: true,  // Mantieni i sourcemap per facilitare il debugging
  },
}));