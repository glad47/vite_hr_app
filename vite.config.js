import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import fs from 'fs'
import path from 'path'

// Generate self-signed cert if not present (for camera access over HTTPS)
let httpsConfig = false
try {
  const keyPath = path.resolve(__dirname, 'cert/key.pem')
  const certPath = path.resolve(__dirname, 'cert/cert.pem')
  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    httpsConfig = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    }
  } else {
    // Enable HTTPS with auto-generated cert
    httpsConfig = true
  }
} catch (e) {
  httpsConfig = true
}

export default defineConfig({
  plugins: [uni()],
  server: {
    port: 9090,
    host: '0.0.0.0',
    https: httpsConfig
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler'
      }
    }
  }
})
