import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import fs from 'node:fs/promises'
import { randomBytes } from 'node:crypto'

// https://vitejs.dev/config/
export default defineConfig({
  // 这里是 server 配置
  server: {
    host: true, // 或者 '0.0.0.0'
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler'
      }
    }
  },
  plugins: [
    vue(),
    {
      name: 'design-image-upload',
      configureServer(server) {
        server.middlewares.use('/api/design-images/upload', async (req, res, next) => {
          if (req.method !== 'POST') return next()

          try {
            const contentType = req.headers['content-type'] || ''
            const boundaryMatch = typeof contentType === 'string' ? contentType.match(/boundary=(.+)$/) : null
            const boundary = boundaryMatch?.[1]
            if (!boundary) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ message: 'Invalid multipart form data: missing boundary' }))
              return
            }

            const chunks: Buffer[] = []
            await new Promise<void>((resolve, reject) => {
              req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
              req.on('end', () => resolve())
              req.on('error', (err) => reject(err))
            })

            const body = Buffer.concat(chunks)
            const boundaryBuffer = Buffer.from(`--${boundary}`)

            const parts: Buffer[] = []
            let start = body.indexOf(boundaryBuffer)
            while (start !== -1) {
              const nextStart = body.indexOf(boundaryBuffer, start + boundaryBuffer.length)
              if (nextStart === -1) break
              const part = body.slice(start + boundaryBuffer.length, nextStart)
              parts.push(part)
              start = nextStart
            }

            let filePart: { filename: string; data: Buffer } | null = null
            for (const rawPart of parts) {
              const part = rawPart
                .toString('binary')
                .replace(/^\r\n/, '')
                .replace(/\r\n$/, '')
              const headerEndIndex = part.indexOf('\r\n\r\n')
              if (headerEndIndex === -1) continue
              const headerStr = part.slice(0, headerEndIndex)
              const contentBinary = part.slice(headerEndIndex + 4)

              const dispMatch = headerStr.match(/Content-Disposition: form-data;([^\r\n]+)/i)
              if (!dispMatch) continue
              const filenameMatch = headerStr.match(/filename="([^"]+)"/i)
              if (!filenameMatch) continue

              const filename = filenameMatch[1]
              const data = Buffer.from(contentBinary, 'binary')
              if (data.length === 0) continue

              filePart = { filename, data }
              break
            }

            if (!filePart) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ message: 'No file found in upload payload' }))
              return
            }

            const originalExt = path.extname(filePart.filename).toLowerCase()
            const allowedExts = new Set(['.png', '.jpg', '.jpeg', '.webp'])
            if (!allowedExts.has(originalExt)) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ message: 'Only PNG/JPG/JPEG/WEBP images are allowed' }))
              return
            }

            const targetDir = path.resolve(__dirname, 'public', 'images', 'design')
            await fs.mkdir(targetDir, { recursive: true })

            const safeName = `${Date.now()}-${randomBytes(8).toString('hex')}${originalExt}`
            const targetPath = path.join(targetDir, safeName)
            await fs.writeFile(targetPath, filePart.data)

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ url: `/images/design/${safeName}` }))
          } catch (err) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ message: 'Upload failed' }))
          }
        })
      }
    }
  ],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  // @ts-ignore
  test: {
    environment: 'jsdom',
    globals: true
  }
})
