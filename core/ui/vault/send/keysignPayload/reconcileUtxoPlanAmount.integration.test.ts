import { create } from '@bufbuild/protobuf'
import { initWasm, WalletCore } from '@trustwallet/wallet-core'
import { Chain } from '@vultisig/core-chain/Chain'
import { toCommCoin } from '@vultisig/core-mpc/types/utils/commCoin'
import { UTXOSpecificSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { KeysignPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { UtxoInfoSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/utxo_info_pb'
import { beforeAll, describe, expect, it } from 'vitest'

import { reconcileUtxoPlanAmount } from './reconcileUtxoPlanAmount'

const address = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'

describe('reconcileUtxoPlanAmount WalletCore integration', () => {
  let walletCore: WalletCore

  beforeAll(async () => {
    walletCore = await initWasm()
  })

  it('reads the actual one-output max amount from a real Bitcoin plan', async () => {
    const keysignPayload = create(KeysignPayloadSchema, {
      coin: toCommCoin({
        chain: Chain.Bitcoin,
        ticker: 'BTC',
        decimals: 8,
        address,
        hexPublicKey: `02${'ab'.repeat(32)}`,
      }),
      toAddress: address,
      toAmount: '999999',
      utxoInfo: [
        create(UtxoInfoSchema, {
          hash: 'ff'.repeat(32),
          amount: 1_000_000n,
          index: 0,
        }),
      ],
      blockchainSpecific: {
        case: 'utxoSpecific',
        value: create(UTXOSpecificSchema, {
          sendMaxAmount: true,
          byteFee: '5',
        }),
      },
    })

    const result = await reconcileUtxoPlanAmount({
      keysignPayload,
      publicKey: {} as never,
      walletCore,
    })

    expect(result.toAmount).toBe('999450')
  })
})
