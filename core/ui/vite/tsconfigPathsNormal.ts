import tsconfigPaths from 'vite-tsconfig-paths'

/**
 * Wraps `vite-tsconfig-paths` to run at normal priority instead of
 * `enforce: 'pre'`. This lets Vite's built-in optimization resolver
 * intercept pre-bundled dependencies before tsconfig paths can
 * resolve them to raw files.
 */
export function tsconfigPathsNormal(...args: Parameters<typeof tsconfigPaths>) {
  const plugin = tsconfigPaths(...args)
  return { ...plugin, enforce: undefined }
}
