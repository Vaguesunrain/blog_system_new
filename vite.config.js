import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // 引入 tailwind 插件

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // 注册插件
  ],
  server: {
    hmr: false, // ❌ 彻底关闭热更新的 WebSocket 连接，从根源解决挂梯子卡顿
  }
})
