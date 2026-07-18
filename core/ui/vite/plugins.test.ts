import type { ConfigEnv, Plugin, UserConfig } from 'vite'
import { describe, expect, it } from 'vitest'

import { topLevelAwaitPlugins } from './plugins'

const configEnv: ConfigEnv = {
  command: 'build',
  mode: 'production',
  isSsrBuild: false,
  isPreview: false,
}

const runConfigHook = (config: UserConfig) => {
  const [defaultMinify] = topLevelAwaitPlugins() as Plugin[]
  const hook = defaultMinify!.config
  if (typeof hook !== 'function') {
    throw new Error('Expected a config hook function')
  }
  return hook.call({} as never, config, configEnv)
}

describe('topLevelAwaitPlugins', () => {
  it('defaults build minification before the top-level-await plugin runs', () => {
    const [defaultMinify, topLevelAwait] = topLevelAwaitPlugins() as Plugin[]

    expect(defaultMinify!.name).toBe('vultisig:default-build-minify')
    expect(topLevelAwait!.name).toBe('vite-plugin-top-level-await')
    expect(runConfigHook({ build: {} })).toEqual({
      build: { minify: 'esbuild' },
    })
  })

  it.each([false, true, 'esbuild', 'terser'] as const)(
    'preserves explicit minify value %j',
    minify => {
      expect(runConfigHook({ build: { minify } })).toBeUndefined()
    }
  )
})
