import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Avoid filesystem canonicalization problems in restricted Windows workspaces.
    preserveSymlinks: true,
  },
})
