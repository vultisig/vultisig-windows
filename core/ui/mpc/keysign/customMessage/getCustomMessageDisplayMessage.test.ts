import { describe, expect, it } from 'vitest'

import { getCustomMessageDisplayMessage } from './getCustomMessageDisplayMessage'
import { getPersonalSignMessage } from './getPersonalSignMessage'

describe('getCustomMessageDisplayMessage', () => {
  it('shows a personal_sign message without its EIP-191 envelope', () => {
    expect(
      getCustomMessageDisplayMessage({
        method: 'personal_sign',
        message: getPersonalSignMessage('Hello from Vultisig'),
      })
    ).toBe('Hello from Vultisig')
  })

  it('shows a personal_sign payload without an envelope as it is', () => {
    expect(
      getCustomMessageDisplayMessage({
        method: 'personal_sign',
        message: 'Hello from Vultisig',
      })
    ).toBe('Hello from Vultisig')
  })

  it('shows other methods as they are', () => {
    const message = getPersonalSignMessage('Hello from Vultisig')

    expect(
      getCustomMessageDisplayMessage({ method: 'eth_sign', message })
    ).toBe(message)
  })
})
