// vite.config.js
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'; // Assuming this is correct for your setup

export default defineConfig(({ mode }) => {
  // Load ALL environment variables (Vite requires this functional syntax for env access)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    
    // 1. USE THE 'define' PROPERTY TO EXPOSE THE KEY GLOBALLY
    // This bypasses potential issues with import.meta.env timing/caching.
    define: {
      // Expose it under a new global variable name (e.g., GLOBAL_GEMINI_KEY)
      // Note: We use JSON.stringify() to ensure the value is treated as a string
      'GLOBAL_GEMINI_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
    }
  };
});