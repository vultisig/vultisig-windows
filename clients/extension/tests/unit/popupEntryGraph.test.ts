/**
 * The action popup's entry chunk must only carry the shell and the home
 * screens (vultisig/vultisig-windows#4918). Every other page reaches the
 * bundle through a dynamic `import()` in the view registries, so a static
 * page import added to either registry would put it back on the first-paint
 * path. This pins the static import lists of both registries.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const root = path.resolve(__dirname, '../../../..')

const staticImportsOf = (file: string) => {
  const source = readFileSync(path.resolve(root, file), 'utf8')

  // Matches `import x from 'y'` and the side-effect form `import 'y'`, and
  // skips type-only imports, which never reach the bundle.
  return [
    ...source.matchAll(
      /^import\s+(?!type[\s{])(?:[^'"]*?\sfrom\s+)?['"]([^'"]+)['"]/gm
    ),
  ].map(match => match[1])
}

describe('popup entry graph', () => {
  it('shared view registry only statically imports its plumbing', () => {
    expect(staticImportsOf('core/ui/navigation/sharedViews.tsx')).toEqual([
      '@core/ui/navigation/CoreView',
      '@lib/ui/navigation/ViewLoaders',
      '../product/brand',
    ])
  })

  it('extension view registry only statically imports the home screens', () => {
    expect(
      staticImportsOf('clients/extension/src/navigation/views.tsx')
    ).toEqual([
      '@clients/extension/src/navigation/AppView',
      '@core/ui/navigation/sharedViews',
      '@core/ui/vault/new',
      '@lib/ui/navigation/lazyViews',
      '@lib/ui/navigation/ViewLoaders',
      '@lib/ui/navigation/Views',
      '@vultisig/lib-utils/record/omit',
      '../components/notifications/ExtensionChooseVaultsView',
      './views/ExtensionVaultPage',
    ])
  })
})
