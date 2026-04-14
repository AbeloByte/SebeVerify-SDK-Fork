import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm', 'iife'],
  globalName: 'SebeVerify',
  dts: false,
  clean: true,
  minify: true,
  outDir: 'dist',
})
