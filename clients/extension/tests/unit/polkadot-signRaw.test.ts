import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockCallPopup = vi.fn()

vi.mock('@core/inpage-provider/background', () => ({
  callBackground: vi.fn(),
}))

vi.mock('@core/inpage-provider/popup', () => ({
  callPopup: (...args: unknown[]) => mockCallPopup(...args),
}))

vi.mock('@clients/extension/src/inpage/providers/core/requestAccount', () => ({
  requestAccount: vi.fn(),
}))

vi.mock('@clients/extension/src/inpage/providers/core/sharedHandlers', () => ({
  getSharedHandlers: vi.fn(() => ({})),
}))

import { Polkadot } from '@clients/extension/src/inpage/providers/polkadot'

const getSignedMessageBytes = () => {
  const [{ signMessage }] = mockCallPopup.mock.calls[0]
  const { message } = signMessage.sign_message
  return Buffer.from(message.replace(/^0x/, ''), 'hex')
}

describe('Polkadot signRaw', () => {
  beforeEach(() => {
    mockCallPopup.mockReset()
    mockCallPopup.mockResolvedValue('aa'.repeat(64))
  })

  const signRaw = async (data: string) => {
    const { signer } = await Polkadot.getInstance().enable()
    return signer.signRaw({
      address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      data,
      type: 'bytes',
    })
  }

  it('sends the raw data to the popup', async () => {
    await signRaw('0x68656c6c6f')

    expect(mockCallPopup).toHaveBeenCalledTimes(1)
  })

  // Issue: the data is signed as is. polkadot-js wraps raw data in
  // `<Bytes>...</Bytes>` so it can never be a valid extrinsic signing payload.
  // `it.fails` keeps CI green while the bug exists and fails once it is fixed,
  // at which point remove the `.fails`.
  it.fails('wraps the data in <Bytes> tags before signing', async () => {
    await signRaw('0x68656c6c6f')

    expect(getSignedMessageBytes().toString()).toBe('<Bytes>hello</Bytes>')
  })
})
