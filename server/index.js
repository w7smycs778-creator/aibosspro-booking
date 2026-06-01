import app from './app.js'
import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Serve the Vite production build and handle client-side routing
const __dirname = dirname(fileURLToPath(import.meta.url))
const distPath = join(__dirname, '..', 'dist')
app.use(express.static(distPath))
app.get('*', (_req, res) => res.sendFile(join(distPath, 'index.html')))

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`\n  Server  →  http://localhost:${PORT}\n`)
})
