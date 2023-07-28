import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import element from 'unplugin-element-plus/vite';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: 'docs',
  },
  plugins: [
    vue(),
    element({
      useSource: true,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(dirname(fileURLToPath(import.meta.url)), 'src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/element/index.scss" as *;`,
      },
      less: {
        modifyVars: {
          // 用于全局导入，以避免需要单独导入每个样式文件。
          // reference:  避免重复引用
          hack: `true; @import (reference) "${resolve(
            'src/styles/variables.less',
          )}";`,
        },
      },
    },
  },
});
