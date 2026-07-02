import { describe, expect, it } from 'vitest'

import { authorizedBackgroundMethods } from './interface'

describe('authorizedBackgroundMethods', () => {
  it('does not expose a global vault chain setter to dApps', () => {
    expect(authorizedBackgroundMethods).toEqual([
      'getAccount',
      'setAppChain',
      'exportVault',
    ])
  })
})
