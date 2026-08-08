import { Chain } from '@vultisig/core-chain/Chain'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { describe, expect, it, vi } from 'vitest'

import { buildSendTxKeysignPayload } from './build'

vi.mock('@vultisig/core-mpc/keysign/chainSpecific', () => ({
  getChainSpecific: vi.fn(async () => undefined),
}))

const solanaCoin: AccountCoin = {
  chain: Chain.Solana,
  id: 'SOL',
  address: 'solana-wallet-address',
  decimals: 9,
  ticker: 'SOL',
}

const publicKey = {
  data: () => new Uint8Array([1, 2, 3, 4]),
}

describe('buildSendTxKeysignPayload', () => {
  it('preserves every raw Solana transaction in the signing payload', async () => {
    const rawTransactions = ['first-transaction', 'second-transaction']

    const payload = await buildSendTxKeysignPayload({
      parsedTx: {
        coin: solanaCoin,
        customTxData: {
          solana: {
            raw: {
              inputCoin: solanaCoin,
              inAmount: '0',
              transactions: rawTransactions,
            },
          },
        },
      },
      publicKey: publicKey as never,
      walletCore: {} as never,
      vaultId: 'vault-id',
      localPartyId: 'local-party',
    })

    expect(payload.signData).toMatchObject({
      case: 'signSolana',
      value: {
        rawTransactions,
      },
    })
  })
})
