var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import fs from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
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
            configureServer: function (server) {
                var _this = this;
                server.middlewares.use(function (req, _res, next) {
                    var _a;
                    if ((_a = req.url) === null || _a === void 0 ? void 0 : _a.startsWith('/ai-short-drama-creator/images/')) {
                        req.url = req.url.replace('/ai-short-drama-creator', '');
                    }
                    next();
                });
                var readRequestBody = function (req) { return __awaiter(_this, void 0, void 0, function () {
                    var chunks;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                chunks = [];
                                return [4 /*yield*/, new Promise(function (resolve, reject) {
                                        req.on('data', function (chunk) { return chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)); });
                                        req.on('end', function () { return resolve(); });
                                        req.on('error', function (err) { return reject(err); });
                                    })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/, Buffer.concat(chunks).toString('utf8')];
                        }
                    });
                }); };
                var readJsonFile = function (filePath) { return __awaiter(_this, void 0, void 0, function () {
                    var raw, parsed, _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                _b.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, fs.readFile(filePath, 'utf8')];
                            case 1:
                                raw = _b.sent();
                                parsed = JSON.parse(raw);
                                if (parsed && typeof parsed === 'object')
                                    return [2 /*return*/, parsed];
                                return [2 /*return*/, {}];
                            case 2:
                                _a = _b.sent();
                                return [2 /*return*/, {}];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); };
                var writeJsonFile = function (filePath, data) { return __awaiter(_this, void 0, void 0, function () {
                    var dir;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                dir = path.dirname(filePath);
                                return [4 /*yield*/, fs.mkdir(dir, { recursive: true })];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8')];
                            case 2:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); };
                var productDesignsPath = path.resolve(__dirname, 'data', 'product_designs.json');
                var productDesignHandler = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
                    var url, data, putPrefix1, putPrefix2, isPut, id, bodyText, payload, existing;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                url = req.url || '';
                                if (!(req.method === 'GET' && (url === '/api/product-designs' || url === '/ai-short-drama-creator/api/product-designs'))) return [3 /*break*/, 2];
                                return [4 /*yield*/, readJsonFile(productDesignsPath)];
                            case 1:
                                data = _a.sent();
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify(data));
                                return [2 /*return*/];
                            case 2:
                                putPrefix1 = '/api/product-designs/';
                                putPrefix2 = '/ai-short-drama-creator/api/product-designs/';
                                isPut = req.method === 'PUT' && (url.startsWith(putPrefix1) || url.startsWith(putPrefix2));
                                if (!isPut) return [3 /*break*/, 6];
                                id = decodeURIComponent(url.startsWith(putPrefix2) ? url.slice(putPrefix2.length) : url.slice(putPrefix1.length));
                                return [4 /*yield*/, readRequestBody(req)];
                            case 3:
                                bodyText = _a.sent();
                                payload = null;
                                try {
                                    payload = JSON.parse(bodyText || '{}');
                                }
                                catch (_b) {
                                    res.statusCode = 400;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.end(JSON.stringify({ message: 'Invalid JSON' }));
                                    return [2 /*return*/];
                                }
                                if (!payload || typeof payload !== 'object') {
                                    res.statusCode = 400;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.end(JSON.stringify({ message: 'Invalid payload' }));
                                    return [2 /*return*/];
                                }
                                payload.id = id;
                                if (typeof payload.updatedAt !== 'number')
                                    payload.updatedAt = Date.now();
                                return [4 /*yield*/, readJsonFile(productDesignsPath)];
                            case 4:
                                existing = _a.sent();
                                existing[id] = payload;
                                return [4 /*yield*/, writeJsonFile(productDesignsPath, existing)];
                            case 5:
                                _a.sent();
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify({ ok: true }));
                                return [2 /*return*/];
                            case 6: return [2 /*return*/, next()];
                        }
                    });
                }); };
                server.middlewares.use(productDesignHandler);
                var uploadHandler = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
                    var contentType, boundaryMatch, boundary, chunks_1, body, boundaryBuffer, parts, start, nextStart, part, filePart, _i, parts_1, rawPart, part, headerEndIndex, headerStr, contentBinary, dispMatch, filenameMatch, filename, data, originalExt, allowedExts, targetDir, safeName, targetPath, err_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (req.method !== 'POST')
                                    return [2 /*return*/, next()];
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 5, , 6]);
                                contentType = req.headers['content-type'] || '';
                                boundaryMatch = typeof contentType === 'string' ? contentType.match(/boundary=(.+)$/) : null;
                                boundary = boundaryMatch === null || boundaryMatch === void 0 ? void 0 : boundaryMatch[1];
                                if (!boundary) {
                                    res.statusCode = 400;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.end(JSON.stringify({ message: 'Invalid multipart form data: missing boundary' }));
                                    return [2 /*return*/];
                                }
                                chunks_1 = [];
                                return [4 /*yield*/, new Promise(function (resolve, reject) {
                                        req.on('data', function (chunk) { return chunks_1.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)); });
                                        req.on('end', function () { return resolve(); });
                                        req.on('error', function (err) { return reject(err); });
                                    })];
                            case 2:
                                _a.sent();
                                body = Buffer.concat(chunks_1);
                                boundaryBuffer = Buffer.from("--".concat(boundary));
                                parts = [];
                                start = body.indexOf(boundaryBuffer);
                                while (start !== -1) {
                                    nextStart = body.indexOf(boundaryBuffer, start + boundaryBuffer.length);
                                    if (nextStart === -1)
                                        break;
                                    part = body.slice(start + boundaryBuffer.length, nextStart);
                                    parts.push(part);
                                    start = nextStart;
                                }
                                filePart = null;
                                for (_i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
                                    rawPart = parts_1[_i];
                                    part = rawPart
                                        .toString('binary')
                                        .replace(/^\r\n/, '')
                                        .replace(/\r\n$/, '');
                                    headerEndIndex = part.indexOf('\r\n\r\n');
                                    if (headerEndIndex === -1)
                                        continue;
                                    headerStr = part.slice(0, headerEndIndex);
                                    contentBinary = part.slice(headerEndIndex + 4);
                                    dispMatch = headerStr.match(/Content-Disposition: form-data;([^\r\n]+)/i);
                                    if (!dispMatch)
                                        continue;
                                    filenameMatch = headerStr.match(/filename="([^"]+)"/i);
                                    if (!filenameMatch)
                                        continue;
                                    filename = filenameMatch[1];
                                    data = Buffer.from(contentBinary, 'binary');
                                    if (data.length === 0)
                                        continue;
                                    filePart = { filename: filename, data: data };
                                    break;
                                }
                                if (!filePart) {
                                    res.statusCode = 400;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.end(JSON.stringify({ message: 'No file found in upload payload' }));
                                    return [2 /*return*/];
                                }
                                originalExt = path.extname(filePart.filename).toLowerCase();
                                allowedExts = new Set(['.png', '.jpg', '.jpeg', '.webp']);
                                if (!allowedExts.has(originalExt)) {
                                    res.statusCode = 400;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.end(JSON.stringify({ message: 'Only PNG/JPG/JPEG/WEBP images are allowed' }));
                                    return [2 /*return*/];
                                }
                                targetDir = path.resolve(__dirname, 'public', 'images', 'design');
                                return [4 /*yield*/, fs.mkdir(targetDir, { recursive: true })];
                            case 3:
                                _a.sent();
                                safeName = "".concat(Date.now(), "-").concat(randomBytes(8).toString('hex')).concat(originalExt);
                                targetPath = path.join(targetDir, safeName);
                                return [4 /*yield*/, fs.writeFile(targetPath, filePart.data)];
                            case 4:
                                _a.sent();
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify({ url: "/ai-short-drama-creator/images/design/".concat(safeName) }));
                                return [3 /*break*/, 6];
                            case 5:
                                err_1 = _a.sent();
                                res.statusCode = 500;
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify({ message: 'Upload failed' }));
                                return [3 /*break*/, 6];
                            case 6: return [2 /*return*/];
                        }
                    });
                }); };
                server.middlewares.use('/api/design-images/upload', function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        return [2 /*return*/, uploadHandler(req, res, next)];
                    });
                }); });
                server.middlewares.use('/ai-short-drama-creator/api/design-images/upload', function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        return [2 /*return*/, uploadHandler(req, res, next)];
                    });
                }); });
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
});
