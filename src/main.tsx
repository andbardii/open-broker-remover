import React from 'react';
import { createRoot } from 'react-dom/client';
import AppInitializer from './AppInitializer.tsx';
import './index.css';

console.log("🚀 Starting the application...");

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("❌ Root element not found!");
} else {
  console.log("✅ Root element found, mounting the application...");
  createRoot(rootElement).render(<AppInitializer />);
}
