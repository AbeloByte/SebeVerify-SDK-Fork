import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['lib/sebeverify-sdk.ts'],
  format: ['cjs', 'esm', 'iife'],
  globalName: 'SebeVerify',
  dts: false,
  clean: true,
  minify: true,
  outDir: 'dist',
})
