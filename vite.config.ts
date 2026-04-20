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
        server.middlewares.use((req, _res, next) => {
          if (req.url?.startsWith('/ai-short-drama-creator/images/')) {
            req.url = req.url.replace('/ai-short-drama-creator', '')
          }
          next()
        })

        const readRequestBody = async (req: any) => {
          const chunks: Buffer[] = []
          await new Promise<void>((resolve, reject) => {
            req.on('data', (chunk: any) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
            req.on('end', () => resolve())
            req.on('error', (err: any) => reject(err))
          })
          return Buffer.concat(chunks).toString('utf8')
        }

        const readJsonFile = async (filePath: string) => {
          try {
            const raw = await fs.readFile(filePath, 'utf8')
            const parsed = JSON.parse(raw)
            if (parsed && typeof parsed === 'object') return parsed
            return {}
          } catch {
            return {}
          }
        }

        const writeJsonFile = async (filePath: string, data: any) => {
          const dir = path.dirname(filePath)
          await fs.mkdir(dir, { recursive: true })
          await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8')
        }

        const productDesignsPath = path.resolve(__dirname, 'data', 'product_designs.json')

        const productDesignHandler = async (req: any, res: any, next: any) => {
          const url = req.url || ''
          if (req.method === 'GET' && (url === '/api/product-designs' || url === '/ai-short-drama-creator/api/product-designs')) {
            const data = await readJsonFile(productDesignsPath)
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(data))
            return
          }

          const putPrefix1 = '/api/product-designs/'
          const putPrefix2 = '/ai-short-drama-creator/api/product-designs/'
          const isPut = req.method === 'PUT' && (url.startsWith(putPrefix1) || url.startsWith(putPrefix2))
          if (isPut) {
            const id = decodeURIComponent(url.startsWith(putPrefix2) ? url.slice(putPrefix2.length) : url.slice(putPrefix1.length))
            const bodyText = await readRequestBody(req)
            let payload: any = null
            try {
              payload = JSON.parse(bodyText || '{}')
            } catch {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ message: 'Invalid JSON' }))
              return
            }
            if (!payload || typeof payload !== 'object') {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ message: 'Invalid payload' }))
              return
            }
            payload.id = id
            if (typeof payload.updatedAt !== 'number') payload.updatedAt = Date.now()

            const existing = await readJsonFile(productDesignsPath)
            existing[id] = payload
            await writeJsonFile(productDesignsPath, existing)

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true }))
            return
          }

          return next()
        }

        server.middlewares.use(productDesignHandler)

        const uploadHandler = async (req: any, res: any, next: any) => {
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
              req.on('data', (chunk: any) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
              req.on('end', () => resolve())
              req.on('error', (err: any) => reject(err))
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
            res.end(JSON.stringify({ url: `/ai-short-drama-creator/images/design/${safeName}` }))
          } catch (err) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ message: 'Upload failed' }))
          }
        }

        server.middlewares.use('/api/design-images/upload', async (req, res, next) => {
          return uploadHandler(req, res, next)
        })

        server.middlewares.use('/ai-short-drama-creator/api/design-images/upload', async (req, res, next) => {
          return uploadHandler(req, res, next)
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
