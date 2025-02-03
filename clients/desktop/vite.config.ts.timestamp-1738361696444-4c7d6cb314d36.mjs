// vite.config.ts
import circleDependency from 'file:///Users/johnnyluo/.yarn/berry/cache/vite-plugin-circular-dependency-npm-0.4.2-11b527b6a3-10c0.zip/node_modules/vite-plugin-circular-dependency/dist/index.mjs';
import react from 'file:///Users/johnnyluo/project/wallet/vultisig-windows/.yarn/__virtual__/@vitejs-plugin-react-virtual-2378b07138/4/.yarn/berry/cache/@vitejs-plugin-react-npm-4.3.4-e5f654de44-10c0.zip/node_modules/@vitejs/plugin-react/dist/index.mjs';
import stdLibBrowser from 'file:///Users/johnnyluo/project/wallet/vultisig-windows/.yarn/__virtual__/vite-plugin-node-stdlib-browser-virtual-2b4c3fdaa4/4/.yarn/berry/cache/vite-plugin-node-stdlib-browser-npm-0.2.1-97a7141753-10c0.zip/node_modules/vite-plugin-node-stdlib-browser/index.cjs';
import { viteStaticCopy } from 'file:///Users/johnnyluo/project/wallet/vultisig-windows/.yarn/__virtual__/vite-plugin-static-copy-virtual-f3ed44def9/4/.yarn/berry/cache/vite-plugin-static-copy-npm-0.17.0-04aa74ffc6-10c0.zip/node_modules/vite-plugin-static-copy/dist/index.js';
import {
  defineConfig,
  normalizePath,
} from 'file:///Users/johnnyluo/project/wallet/vultisig-windows/.yarn/__virtual__/vite-virtual-6aee0463ad/4/.yarn/berry/cache/vite-npm-4.5.9-7be7fb60da-10c0.zip/node_modules/vite/dist/node/index.js';
import path from 'path';

// build.json
var version = '1.0.11';
var build = 11;

// vite.config.ts
var __vite_injected_original_dirname =
  '/Users/johnnyluo/project/wallet/vultisig-windows/clients/desktop';
var vite_config_default = defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(version),
    __APP_BUILD__: JSON.stringify(build),
  },
  plugins: [
    react(),
    stdLibBrowser(),
    viteStaticCopy({
      targets: [
        {
          src: normalizePath(
            path.resolve(
              __vite_injected_original_dirname,
              'node_modules/@trustwallet/wallet-core/dist/lib/wallet-core.wasm'
            )
          ),
          dest: '',
        },
        {
          src: normalizePath(
            path.resolve(
              __vite_injected_original_dirname,
              'node_modules/7z-wasm/7zz.wasm'
            )
          ),
          dest: '7z-wasm',
        },
      ],
    }),
    circleDependency({
      // Exclude node_modules from the check to focus on your code
      exclude: /node_modules/,
      // Do not fail the build on error, so we can see all circular dependencies
      circleImportThrowErr: false,
      // This function is called when a circular dependency is detected
      formatOutModulePath(path2) {
        const str = 'Circular dependency detected:';
        return str + path2;
      },
    }),
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  publicDir: 'public',
  resolve: {
    alias: {
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      buffer: 'buffer',
      'fs/promises': 'node-stdlib-browser/mock/empty',
    },
  },
  optimizeDeps: {
    include: ['crypto-browserify', 'stream-browserify', 'buffer'],
  },
});
export { vite_config_default as default };
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAiYnVpbGQuanNvbiJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9qb2hubnlsdW8vcHJvamVjdC93YWxsZXQvdnVsdGlzaWctd2luZG93cy93b3Jrc3BhY2UvZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9qb2hubnlsdW8vcHJvamVjdC93YWxsZXQvdnVsdGlzaWctd2luZG93cy93b3Jrc3BhY2UvZnJvbnRlbmQvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2pvaG5ueWx1by9wcm9qZWN0L3dhbGxldC92dWx0aXNpZy13aW5kb3dzL3dvcmtzcGFjZS9mcm9udGVuZC92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IGRlZmluZUNvbmZpZywgbm9ybWFsaXplUGF0aCB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IGNpcmNsZURlcGVuZGVuY3kgZnJvbSAndml0ZS1wbHVnaW4tY2lyY3VsYXItZGVwZW5kZW5jeSc7XG5pbXBvcnQgc3RkTGliQnJvd3NlciBmcm9tICd2aXRlLXBsdWdpbi1ub2RlLXN0ZGxpYi1icm93c2VyJztcbmltcG9ydCB7IHZpdGVTdGF0aWNDb3B5IH0gZnJvbSAndml0ZS1wbHVnaW4tc3RhdGljLWNvcHknO1xuXG5pbXBvcnQgKiBhcyBidWlsZEluZm8gZnJvbSAnLi9idWlsZC5qc29uJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgZGVmaW5lOiB7XG4gICAgX19BUFBfVkVSU0lPTl9fOiBKU09OLnN0cmluZ2lmeShidWlsZEluZm8udmVyc2lvbiksXG4gICAgX19BUFBfQlVJTERfXzogSlNPTi5zdHJpbmdpZnkoYnVpbGRJbmZvLmJ1aWxkKSxcbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgc3RkTGliQnJvd3NlcigpLFxuICAgIHZpdGVTdGF0aWNDb3B5KHtcbiAgICAgIHRhcmdldHM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHNyYzogbm9ybWFsaXplUGF0aChcbiAgICAgICAgICAgIHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgX19kaXJuYW1lLFxuICAgICAgICAgICAgICAnbm9kZV9tb2R1bGVzL0B0cnVzdHdhbGxldC93YWxsZXQtY29yZS9kaXN0L2xpYi93YWxsZXQtY29yZS53YXNtJ1xuICAgICAgICAgICAgKVxuICAgICAgICAgICksXG4gICAgICAgICAgZGVzdDogJycsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBzcmM6IG5vcm1hbGl6ZVBhdGgoXG4gICAgICAgICAgICBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnbm9kZV9tb2R1bGVzLzd6LXdhc20vN3p6Lndhc20nKVxuICAgICAgICAgICksXG4gICAgICAgICAgZGVzdDogJzd6LXdhc20nLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9KSxcbiAgICBjaXJjbGVEZXBlbmRlbmN5KHtcbiAgICAgIC8vIEV4Y2x1ZGUgbm9kZV9tb2R1bGVzIGZyb20gdGhlIGNoZWNrIHRvIGZvY3VzIG9uIHlvdXIgY29kZVxuICAgICAgZXhjbHVkZTogL25vZGVfbW9kdWxlcy8sXG4gICAgICAvLyBEbyBub3QgZmFpbCB0aGUgYnVpbGQgb24gZXJyb3IsIHNvIHdlIGNhbiBzZWUgYWxsIGNpcmN1bGFyIGRlcGVuZGVuY2llc1xuICAgICAgY2lyY2xlSW1wb3J0VGhyb3dFcnI6IGZhbHNlLFxuICAgICAgLy8gVGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgd2hlbiBhIGNpcmN1bGFyIGRlcGVuZGVuY3kgaXMgZGV0ZWN0ZWRcbiAgICAgIGZvcm1hdE91dE1vZHVsZVBhdGgocGF0aCkge1xuICAgICAgICBjb25zdCBzdHIgPSAnQ2lyY3VsYXIgZGVwZW5kZW5jeSBkZXRlY3RlZDonO1xuICAgICAgICByZXR1cm4gc3RyICsgcGF0aDtcbiAgICAgIH0sXG4gICAgfSksXG4gIF0sXG4gIGJ1aWxkOiB7XG4gICAgb3V0RGlyOiAnZGlzdCcsXG4gICAgYXNzZXRzRGlyOiAnYXNzZXRzJyxcbiAgfSxcbiAgcHVibGljRGlyOiAncHVibGljJyxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICBjcnlwdG86ICdjcnlwdG8tYnJvd3NlcmlmeScsXG4gICAgICBzdHJlYW06ICdzdHJlYW0tYnJvd3NlcmlmeScsXG4gICAgICBidWZmZXI6ICdidWZmZXInLFxuICAgICAgJ2ZzL3Byb21pc2VzJzogJ25vZGUtc3RkbGliLWJyb3dzZXIvbW9jay9lbXB0eScsXG4gICAgfSxcbiAgfSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgaW5jbHVkZTogWydjcnlwdG8tYnJvd3NlcmlmeScsICdzdHJlYW0tYnJvd3NlcmlmeScsICdidWZmZXInXSxcbiAgfSxcbn0pO1xuIiwgIntcbiAgXCJ2ZXJzaW9uXCI6IFwiMS4wLjExXCIsXG4gIFwiYnVpbGRcIjogMTFcbn0iXSwKICAibWFwcGluZ3MiOiAiO0FBQTJYLE9BQU8sV0FBVztBQUM3WSxPQUFPLFVBQVU7QUFDakIsU0FBUyxjQUFjLHFCQUFxQjtBQUM1QyxPQUFPLHNCQUFzQjtBQUM3QixPQUFPLG1CQUFtQjtBQUMxQixTQUFTLHNCQUFzQjs7O0FDSjdCLGNBQVc7QUFDWCxZQUFTOzs7QURGWCxJQUFNLG1DQUFtQztBQVN6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixRQUFRO0FBQUEsSUFDTixpQkFBaUIsS0FBSyxVQUFvQixPQUFPO0FBQUEsSUFDakQsZUFBZSxLQUFLLFVBQW9CLEtBQUs7QUFBQSxFQUMvQztBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sY0FBYztBQUFBLElBQ2QsZUFBZTtBQUFBLE1BQ2IsU0FBUztBQUFBLFFBQ1A7QUFBQSxVQUNFLEtBQUs7QUFBQSxZQUNILEtBQUs7QUFBQSxjQUNIO0FBQUEsY0FDQTtBQUFBLFlBQ0Y7QUFBQSxVQUNGO0FBQUEsVUFDQSxNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLEtBQUs7QUFBQSxZQUNILEtBQUssUUFBUSxrQ0FBVywrQkFBK0I7QUFBQSxVQUN6RDtBQUFBLFVBQ0EsTUFBTTtBQUFBLFFBQ1I7QUFBQSxNQUNGO0FBQUEsSUFDRixDQUFDO0FBQUEsSUFDRCxpQkFBaUI7QUFBQTtBQUFBLE1BRWYsU0FBUztBQUFBO0FBQUEsTUFFVCxzQkFBc0I7QUFBQTtBQUFBLE1BRXRCLG9CQUFvQkEsT0FBTTtBQUN4QixjQUFNLE1BQU07QUFDWixlQUFPLE1BQU1BO0FBQUEsTUFDZjtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLFdBQVc7QUFBQSxFQUNiO0FBQUEsRUFDQSxXQUFXO0FBQUEsRUFDWCxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsTUFDUixRQUFRO0FBQUEsTUFDUixRQUFRO0FBQUEsTUFDUixlQUFlO0FBQUEsSUFDakI7QUFBQSxFQUNGO0FBQUEsRUFDQSxjQUFjO0FBQUEsSUFDWixTQUFTLENBQUMscUJBQXFCLHFCQUFxQixRQUFRO0FBQUEsRUFDOUQ7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogWyJwYXRoIl0KfQo=
