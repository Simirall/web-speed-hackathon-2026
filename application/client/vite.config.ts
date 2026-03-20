import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import tailwindcss from '@tailwindcss/vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

export default defineConfig({
  root: path.resolve(__dirname, "."),
  publicDir: path.resolve(__dirname, "../public"),
  build: {
    outDir: path.resolve(__dirname, "../dist"),
    emptyOutDir: true,
    minify: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        entryFileNames: "scripts/[name].js",
        chunkFileNames: "scripts/chunk-[hash].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith(".css")) return "styles/[name][extname]";
          return "assets/[name][extname]";
        },
      },
      treeshake: true,
    },
  },
  plugins: [
    react(),
    babel({
      presets: [reactCompilerPreset()]
    }),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        {
          src: path
            .join(path.dirname(require.resolve("katex/package.json")), "dist/fonts")
            .replace(/\\/g, "/") + "/*",
          dest: "styles/fonts",
        },
      ],
    }),
  ],
  resolve: {
    alias: [
      // 完全一致エイリアス (webpack の $ サフィックス相当)
      {
        find: /^bayesian-bm25$/,
        replacement: path.resolve(__dirname, "node_modules/bayesian-bm25/dist/index.js"),
      },
      {
        find: /^kuromoji$/,
        replacement: path.resolve(__dirname, "node_modules/kuromoji/build/kuromoji.js"),
      },
      {
        find: /^@ffmpeg\/ffmpeg$/,
        replacement: path.resolve(__dirname, "node_modules/@ffmpeg/ffmpeg/dist/esm/index.js"),
      },
      {
        find: /^@ffmpeg\/core$/,
        replacement: path.resolve(__dirname, "node_modules/@ffmpeg/core/dist/umd/ffmpeg-core.js"),
      },
      {
        find: /^@ffmpeg\/core\/wasm$/,
        replacement: path.resolve(__dirname, "node_modules/@ffmpeg/core/dist/umd/ffmpeg-core.wasm"),
      },
      {
        find: /^@imagemagick\/magick-wasm\/magick\.wasm$/,
        replacement: path.resolve(__dirname, "node_modules/@imagemagick/magick-wasm/dist/magick.wasm"),
      },
      // プレフィックスエイリアス (tsconfig の paths 相当)
      {
        find: "@web-speed-hackathon-2026/client",
        replacement: path.resolve(__dirname, "."),
      },
    ],
  },
  define: {
    // buildinfo.ts の process.env["..."] / process.env.XXX を置換
    "process.env": JSON.stringify({
      BUILD_DATE: process.env["BUILD_DATE"] ?? new Date().toISOString(),
      COMMIT_HASH: process.env["SOURCE_VERSION"] ?? "",
      NODE_ENV: process.env["NODE_ENV"] ?? "development",
    }),
  },
  server: {
    host: "0.0.0.0",
    port: 8080,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: false,
      },
    },
  },
  optimizeDeps: {
    // 大容量バイナリを事前バンドルから除外
    exclude: ["@ffmpeg/core", "@imagemagick/magick-wasm"],
  },
});
