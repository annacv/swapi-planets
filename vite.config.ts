import { fileURLToPath, URL } from 'node:url'

import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

/** Inline hashed CSS into index.html so it is not a render-blocking request. */
function inlineCss(): Plugin {
  return {
    name: 'inline-css',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, { bundle }) {
        if (!bundle) return html

        return html.replace(
          /<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi,
          (tag) => {
            const href = tag.match(/\bhref=["']([^"']+)["']/i)?.[1]
            if (!href) return tag

            const asset = Object.values(bundle).find(
              (item) => item.type === 'asset' && href.endsWith(item.fileName),
            )
            if (!asset || asset.type !== 'asset') return tag

            const css =
              typeof asset.source === 'string'
                ? asset.source
                : new TextDecoder().decode(asset.source)

            return `<style>${css}</style>`
          },
        )
      },
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages project sites are served from /<repo>/; CI sets BASE_PATH.
  base: process.env.BASE_PATH ? `${process.env.BASE_PATH.replace(/\/$/, '')}/` : '/',
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    inlineCss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
