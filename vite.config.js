import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
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
    plugins: [vue()],
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
