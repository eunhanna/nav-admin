import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 3001, strictPort: true },
  base:
    process.env.VITE_BASE_PATH ??
    (process.env.GITHUB_REPOSITORY
      ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/`
      : '/'),
})
