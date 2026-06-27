import { describe, expect, it } from 'vitest'

import { authorizedBackgroundMethods } from './interface'

describe('authorizedBackgroundMethods', () => {
  it('requires an authorized app session before changing the global vault chain', () => {
    expect(authorizedBackgroundMethods).toContain('setVaultChain')
  })
})
