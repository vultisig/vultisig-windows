// vite.config.ts
import { defineConfig, normalizePath } from "file:///Users/enriquesouza/projects/vultisig/windows/vultisig-windows/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///Users/enriquesouza/projects/vultisig/windows/vultisig-windows/frontend/node_modules/@vitejs/plugin-react/dist/index.mjs";
import stdLibBrowser from "file:///Users/enriquesouza/projects/vultisig/windows/vultisig-windows/frontend/node_modules/vite-plugin-node-stdlib-browser/index.cjs";
import { viteStaticCopy } from "file:///Users/enriquesouza/projects/vultisig/windows/vultisig-windows/frontend/node_modules/vite-plugin-static-copy/dist/index.js";
import path from "path";
var __vite_injected_original_dirname = "/Users/enriquesouza/projects/vultisig/windows/vultisig-windows/frontend";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    stdLibBrowser(),
    viteStaticCopy({
      targets: [
        {
          src: normalizePath(
            path.resolve(
              __vite_injected_original_dirname,
              "node_modules/@trustwallet/wallet-core/dist/lib/wallet-core.wasm"
            )
          ),
          dest: ""
        },
        {
          src: normalizePath(
            path.resolve(__vite_injected_original_dirname, "node_modules/7z-wasm/7zz.wasm")
          ),
          dest: "7z-wasm"
        }
      ]
    })
  ],
  build: {
    outDir: "dist",
    assetsDir: "assets"
  },
  publicDir: "public",
  resolve: {
    alias: {
      crypto: "crypto-browserify",
      stream: "stream-browserify",
      buffer: "buffer",
      "fs/promises": "node-stdlib-browser/mock/empty"
    }
  },
  optimizeDeps: {
    include: ["crypto-browserify", "stream-browserify", "buffer"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvZW5yaXF1ZXNvdXphL3Byb2plY3RzL3Z1bHRpc2lnL3dpbmRvd3MvdnVsdGlzaWctd2luZG93cy9mcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2VucmlxdWVzb3V6YS9wcm9qZWN0cy92dWx0aXNpZy93aW5kb3dzL3Z1bHRpc2lnLXdpbmRvd3MvZnJvbnRlbmQvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2VucmlxdWVzb3V6YS9wcm9qZWN0cy92dWx0aXNpZy93aW5kb3dzL3Z1bHRpc2lnLXdpbmRvd3MvZnJvbnRlbmQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIG5vcm1hbGl6ZVBhdGggfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgc3RkTGliQnJvd3NlciBmcm9tICd2aXRlLXBsdWdpbi1ub2RlLXN0ZGxpYi1icm93c2VyJztcbmltcG9ydCB7IHZpdGVTdGF0aWNDb3B5IH0gZnJvbSAndml0ZS1wbHVnaW4tc3RhdGljLWNvcHknO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICBzdGRMaWJCcm93c2VyKCksXG4gICAgdml0ZVN0YXRpY0NvcHkoe1xuICAgICAgdGFyZ2V0czogW1xuICAgICAgICB7XG4gICAgICAgICAgc3JjOiBub3JtYWxpemVQYXRoKFxuICAgICAgICAgICAgcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICBfX2Rpcm5hbWUsXG4gICAgICAgICAgICAgICdub2RlX21vZHVsZXMvQHRydXN0d2FsbGV0L3dhbGxldC1jb3JlL2Rpc3QvbGliL3dhbGxldC1jb3JlLndhc20nXG4gICAgICAgICAgICApXG4gICAgICAgICAgKSxcbiAgICAgICAgICBkZXN0OiAnJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHNyYzogbm9ybWFsaXplUGF0aChcbiAgICAgICAgICAgIHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdub2RlX21vZHVsZXMvN3otd2FzbS83enoud2FzbScpXG4gICAgICAgICAgKSxcbiAgICAgICAgICBkZXN0OiAnN3otd2FzbScsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0pLFxuICBdLFxuICBidWlsZDoge1xuICAgIG91dERpcjogJ2Rpc3QnLFxuICAgIGFzc2V0c0RpcjogJ2Fzc2V0cycsXG4gIH0sXG4gIHB1YmxpY0RpcjogJ3B1YmxpYycsXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgY3J5cHRvOiAnY3J5cHRvLWJyb3dzZXJpZnknLFxuICAgICAgc3RyZWFtOiAnc3RyZWFtLWJyb3dzZXJpZnknLFxuICAgICAgYnVmZmVyOiAnYnVmZmVyJyxcbiAgICAgICdmcy9wcm9taXNlcyc6ICdub2RlLXN0ZGxpYi1icm93c2VyL21vY2svZW1wdHknLFxuICAgIH0sXG4gIH0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGluY2x1ZGU6IFsnY3J5cHRvLWJyb3dzZXJpZnknLCAnc3RyZWFtLWJyb3dzZXJpZnknLCAnYnVmZmVyJ10sXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBdVksU0FBUyxjQUFjLHFCQUFxQjtBQUNuYixPQUFPLFdBQVc7QUFDbEIsT0FBTyxtQkFBbUI7QUFDMUIsU0FBUyxzQkFBc0I7QUFDL0IsT0FBTyxVQUFVO0FBSmpCLElBQU0sbUNBQW1DO0FBT3pDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLGNBQWM7QUFBQSxJQUNkLGVBQWU7QUFBQSxNQUNiLFNBQVM7QUFBQSxRQUNQO0FBQUEsVUFDRSxLQUFLO0FBQUEsWUFDSCxLQUFLO0FBQUEsY0FDSDtBQUFBLGNBQ0E7QUFBQSxZQUNGO0FBQUEsVUFDRjtBQUFBLFVBQ0EsTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxLQUFLO0FBQUEsWUFDSCxLQUFLLFFBQVEsa0NBQVcsK0JBQStCO0FBQUEsVUFDekQ7QUFBQSxVQUNBLE1BQU07QUFBQSxRQUNSO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLFdBQVc7QUFBQSxFQUNiO0FBQUEsRUFDQSxXQUFXO0FBQUEsRUFDWCxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsTUFDUixRQUFRO0FBQUEsTUFDUixRQUFRO0FBQUEsTUFDUixlQUFlO0FBQUEsSUFDakI7QUFBQSxFQUNGO0FBQUEsRUFDQSxjQUFjO0FBQUEsSUFDWixTQUFTLENBQUMscUJBQXFCLHFCQUFxQixRQUFRO0FBQUEsRUFDOUQ7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
