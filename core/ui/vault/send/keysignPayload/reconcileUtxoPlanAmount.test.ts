import { create } from '@bufbuild/protobuf'
import { getUtxoSigningInputs } from '@vultisig/core-mpc/keysign/signingInputs/resolvers/utxo'
import { UTXOSpecificSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import {
  KeysignPayload,
  KeysignPayloadSchema,
} from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { reconcileUtxoPlanAmount } from './reconcileUtxoPlanAmount'

vi.mock('@vultisig/core-mpc/keysign/signingInputs/resolvers/utxo', () => ({
  getUtxoSigningInputs: vi.fn(),
}))

const walletCore = {} as never
const publicKey = {} as never

const getPayload = ({
  sendMaxAmount,
  toAmount = '999450',
}: {
  sendMaxAmount?: boolean
  toAmount?: string
} = {}): KeysignPayload =>
  create(KeysignPayloadSchema, {
    toAmount,
    blockchainSpecific:
      sendMaxAmount === undefined
        ? undefined
        : {
            case: 'utxoSpecific',
            value: create(UTXOSpecificSchema, { sendMaxAmount }),
          },
  })

describe('reconcileUtxoPlanAmount', () => {
  beforeEach(() => {
    vi.mocked(getUtxoSigningInputs).mockReset()
  })

  it('replaces a max payload amount with the WalletCore plan amount', async () => {
    vi.mocked(getUtxoSigningInputs).mockResolvedValue([
      { plan: { amount: { toString: () => '999100' } } } as never,
    ])
    const payload = getPayload({ sendMaxAmount: true })

    const result = await reconcileUtxoPlanAmount({
      keysignPayload: payload,
      publicKey,
      walletCore,
    })

    expect(result.toAmount).toBe('999100')
    expect(getUtxoSigningInputs).toHaveBeenCalledWith({
      keysignPayload: payload,
      publicKey,
      walletCore,
    })
  })

  it('leaves a regular UTXO payload unchanged', async () => {
    const payload = getPayload({ sendMaxAmount: false })

    await expect(
      reconcileUtxoPlanAmount({
        keysignPayload: payload,
        publicKey,
        walletCore,
      })
    ).resolves.toBe(payload)
    expect(getUtxoSigningInputs).not.toHaveBeenCalled()
  })

  it('leaves a non-UTXO payload unchanged', async () => {
    const payload = getPayload()

    await expect(
      reconcileUtxoPlanAmount({
        keysignPayload: payload,
        publicKey,
        walletCore,
      })
    ).resolves.toBe(payload)
    expect(getUtxoSigningInputs).not.toHaveBeenCalled()
  })
})
