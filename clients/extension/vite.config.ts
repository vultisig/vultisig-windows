import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'
import webExtension from 'vite-plugin-web-extension'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'force-es-format-everywhere',
      config(config) {
        const output = config?.build?.rollupOptions?.output
        if (Array.isArray(output)) {
          output.forEach(o => (o.format = 'es'))
        } else if (output) {
          output.format = 'es'
        }
      },
    },
    webExtension({
      manifest: path.resolve(__dirname, 'manifest.json'),
      browser: 'chrome',
      scriptViteConfig: defineConfig({
        build: {
          rollupOptions: {
            output: {
              format: 'es',
              inlineDynamicImports: false,
            },
          },
        },
      }),
      htmlViteConfig: defineConfig({
        build: {
          rollupOptions: {
            output: {
              format: 'es',
              inlineDynamicImports: false,
            },
          },
        },
      }),
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '~': path.resolve(__dirname, 'src/styles'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'legacy',
        includePaths: [path.resolve(__dirname, 'src/styles')],
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, 'src/pages/popup/popup.html'),
        vault: path.resolve(__dirname, 'src/pages/vault/vault.html'),
        vaults: path.resolve(__dirname, 'src/pages/vaults/vaults.html'),
        transaction: path.resolve(
          __dirname,
          'src/pages/transaction/transaction.html'
        ),
        accounts: path.resolve(__dirname, 'src/pages/accounts/accounts.html'),
        import: path.resolve(__dirname, 'src/pages/import/import.html'),
      },
      output: {
        format: 'es',
        inlineDynamicImports: false,
      },
    },
  },
})
