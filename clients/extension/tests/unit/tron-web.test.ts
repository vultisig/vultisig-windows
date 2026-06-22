import { callBackground } from '@core/inpage-provider/background'
import { callPopup } from '@core/inpage-provider/popup'
import { Chain } from '@vultisig/core-chain/Chain'
import { deserializeSigningOutput } from '@vultisig/core-chain/tw/signingOutput'
import { fromHex } from 'tronweb/utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@core/inpage-provider/background', () => ({
  callBackground: vi.fn(),
}))

vi.mock('@core/inpage-provider/popup', () => ({
  callPopup: vi.fn(),
}))

vi.mock('@vultisig/core-chain/tw/signingOutput', () => ({
  deserializeSigningOutput: vi.fn(),
}))

vi.mock('@clients/extension/src/inpage/providers/ethereum', () => ({
  processSignature: vi.fn((signature: string) => signature),
}))

import { VultisigTronWeb } from '@clients/extension/src/inpage/providers/tronWeb/tronWeb'

const ownerHex = '411111111111111111111111111111111111111111'
const contractHex = '412222222222222222222222222222222222222222'
const recipientHex = '413333333333333333333333333333333333333333'

const pad64 = (value: string) => value.padStart(64, '0')

const makeTrc20TransferData = (amount: bigint) =>
  ['a9059cbb', pad64(recipientHex.slice(2)), pad64(amount.toString(16))].join(
    ''
  )

const makeTriggerSmartContractTransaction = (amount: bigint) =>
  ({
    raw_data: {
      contract: [
        {
          type: 'TriggerSmartContract',
          parameter: {
            value: {
              owner_address: ownerHex,
              contract_address: contractHex,
              data: makeTrc20TransferData(amount),
              call_value: 0,
            },
          },
        },
      ],
      expiration: 1,
      timestamp: 2,
      ref_block_bytes: '0000',
      ref_block_hash: '00'.repeat(8),
      fee_limit: 100_000_000,
    },
  }) as any

describe('VultisigTronWeb.trx.sign', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(deserializeSigningOutput).mockReturnValue({
      signature: Uint8Array.from([1, 2, 3]),
    } as never)
    vi.mocked(callPopup).mockResolvedValue([
      { data: new Uint8Array() },
    ] as never)
  })

  it('uses TRC-20 token metadata decimals and ticker for keysign display', async () => {
    vi.mocked(callBackground).mockResolvedValue({
      ticker: 'JST',
      decimals: 18,
      logo: undefined,
    } as never)

    const tronWeb = new VultisigTronWeb()
    await tronWeb.trx.sign(
      makeTriggerSmartContractTransaction(10_000_000_000_000_000_000n)
    )

    expect(callBackground).toHaveBeenCalledWith({
      getTokenMetadata: {
        chain: Chain.Tron,
        id: fromHex(contractHex),
      },
    })

    expect(callPopup).toHaveBeenCalledWith(
      {
        sendTx: {
          keysign: {
            chain: Chain.Tron,
            transactionDetails: expect.objectContaining({
              asset: {
                ticker: 'JST',
                contractAddress: fromHex(contractHex),
              },
              amount: {
                amount: '10000000000000000000',
                decimals: 18,
              },
              to: recipientHex,
            }),
          },
        },
      },
      {
        account: fromHex(ownerHex),
      }
    )
  })

  it('refuses TRC-20 signing when token metadata cannot be resolved', async () => {
    vi.mocked(callBackground).mockRejectedValue(
      new Error('metadata unavailable')
    )

    const tronWeb = new VultisigTronWeb()

    await expect(
      tronWeb.trx.sign(makeTriggerSmartContractTransaction(1_000_000n))
    ).rejects.toThrow('Could not resolve TRC-20 token metadata')
    expect(callPopup).not.toHaveBeenCalled()
  })
})
