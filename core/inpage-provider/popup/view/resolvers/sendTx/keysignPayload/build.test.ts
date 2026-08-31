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

const tonCoin: AccountCoin = {
  chain: Chain.Ton,
  address: 'UQCc9iCgP_b5RMJcFE5XD8zStfjtNHLhDWfUqC5m1SjSer95',
  decimals: 9,
  ticker: 'GRAM',
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

  // A TonConnect message may deploy a contract: its `stateInit` is the code the
  // destination does not have yet. Dropping it here signs a plain transfer to an
  // address with no code, so every message must reach the signer with its own.
  it('keeps each TonConnect message stateInit in the signTon payload', async () => {
    const deployMessage = {
      to: 'EQARULUYsmJq1RiZ-YiH-IJLcAZUVkVff-KBPwEmmaQGH6aC',
      amount: '50000000',
      payload: 'te6cckEBAQEABgAACAAAAA==',
      stateInit: 'te6cckEBAQEAJAAAQ4ABase64EncodedStateInit',
    }
    const plainMessage = {
      to: 'EQDmLe6ticcY_uLZsfurdYONshNuCn8IS81KcJ8p6M6ISJrE',
      amount: '50000000',
    }

    const payload = await buildSendTxKeysignPayload({
      parsedTx: {
        coin: tonCoin,
        customTxData: {
          regular: {
            chain: Chain.Ton,
            coin: tonCoin,
            transactionDetails: {
              from: tonCoin.address,
              to: deployMessage.to,
              asset: { ticker: tonCoin.ticker },
              amount: {
                amount: deployMessage.amount,
                decimals: tonCoin.decimals,
              },
              data: deployMessage.payload,
              tonMessages: [deployMessage, plainMessage],
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
      case: 'signTon',
      value: { tonMessages: [deployMessage, plainMessage] },
    })

    const [, secondMessage] =
      payload.signData.case === 'signTon'
        ? payload.signData.value.tonMessages
        : []

    expect(secondMessage?.stateInit).toBeUndefined()
  })
})
