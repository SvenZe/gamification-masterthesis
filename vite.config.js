import { defineConfig } from 'vite';

export default defineConfig({
  root: 'public', // Setzt das 'public' Verzeichnis als Root für Vite
  build: {
    outDir: '../dist', // Ausgabeordner für den Build (Standard ist 'dist')
  },
});