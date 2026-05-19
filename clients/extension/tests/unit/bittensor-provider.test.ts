import { OtherChain } from '@vultisig/core-chain/Chain'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockCallBackground = vi.fn()
const mockCallPopup = vi.fn()
const mockRequestAccount = vi.fn()

vi.mock('@core/inpage-provider/background', () => ({
  callBackground: (...args: unknown[]) => mockCallBackground(...args),
}))

vi.mock('@core/inpage-provider/popup', () => ({
  callPopup: (...args: unknown[]) => mockCallPopup(...args),
}))

vi.mock('@clients/extension/src/inpage/providers/core/requestAccount', () => ({
  requestAccount: (...args: unknown[]) => mockRequestAccount(...args),
}))

vi.mock('@clients/extension/src/inpage/providers/core/sharedHandlers', () => ({
  getSharedHandlers: vi.fn(() => ({})),
}))

import { Bittensor } from '@clients/extension/src/inpage/providers/bittensor'

describe('Bittensor provider', () => {
  beforeEach(() => {
    Bittensor.instance = null
    vi.clearAllMocks()
  })

  it('requests Bittensor account access on enable', async () => {
    mockRequestAccount.mockResolvedValue(undefined)

    await new Bittensor().enable()

    expect(mockRequestAccount).toHaveBeenCalledWith(OtherChain.Bittensor)
  })

  it('returns Bittensor accounts from background', async () => {
    mockCallBackground.mockResolvedValue({
      address: '5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM',
    })

    await expect(new Bittensor().getAccounts()).resolves.toEqual([
      {
        address: '5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM',
        type: 'ed25519',
      },
    ])
  })

  it('signs payloads as serialized Bittensor requests and returns an Ed25519 MultiSignature', async () => {
    const signature = Uint8Array.from([1, 2, 3])
    mockCallPopup.mockResolvedValue([
      { data: { encoded: Buffer.from(signature).toString('base64') } },
    ])

    const payload = {
      address: '5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM',
      blockHash: '0xabc',
      blockNumber: '0x1',
      era: '0x00',
      genesisHash: '0xdef',
      method: '0x0500',
      nonce: '0x0',
      signedExtensions: [],
      specVersion: '0x1',
      tip: '0x0',
      transactionVersion: '0x1',
      version: 4,
    }

    await expect(new Bittensor().signPayload(payload)).resolves.toMatchObject({
      id: expect.any(Number),
      signature: '0x00010203',
    })

    expect(mockCallPopup).toHaveBeenCalledWith(
      {
        sendTx: {
          serialized: {
            data: [JSON.stringify(payload)],
            chain: OtherChain.Bittensor,
            skipBroadcast: true,
          },
        },
      },
      { account: payload.address }
    )
  })

  it('prefixes raw signatures as Ed25519 MultiSignatures', async () => {
    mockCallPopup.mockResolvedValue('010203')

    await expect(
      new Bittensor().signRaw({
        address: '5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM',
        data: '0x1234',
        type: 'bytes',
      })
    ).resolves.toMatchObject({
      id: expect.any(Number),
      signature: '0x00010203',
    })
  })
})
