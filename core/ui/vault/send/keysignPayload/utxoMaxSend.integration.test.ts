import { create } from '@bufbuild/protobuf'
import { initWasm, WalletCore } from '@trustwallet/wallet-core'
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core'
import { getMaxSendableAmount } from '@vultisig/core-chain/amount/getMaxSendableAmount'
import { Chain } from '@vultisig/core-chain/Chain'
import { getFeeAmount } from '@vultisig/core-mpc/keysign/fee'
import { refineKeysignUtxo } from '@vultisig/core-mpc/keysign/refine/utxo'
import { toCommCoin } from '@vultisig/core-mpc/types/utils/commCoin'
import { UTXOSpecificSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { KeysignPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { UtxoInfoSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/utxo_info_pb'
import { beforeAll, describe, expect, it } from 'vitest'

import { isUtxoMaxSend } from '../amount/isUtxoMaxSend'
import { reconcileUtxoPlanAmount } from './reconcileUtxoPlanAmount'

const address = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
const hexPublicKey = `02${'ab'.repeat(32)}`
const balance = 1_000_000n

const defaultByteFee = 5n

const getPayload = ({
  amount,
  sendMaxAmount,
  byteFee = defaultByteFee,
}: {
  amount: bigint
  sendMaxAmount: boolean
  byteFee?: bigint
}) =>
  create(KeysignPayloadSchema, {
    coin: toCommCoin({
      chain: Chain.Bitcoin,
      ticker: 'BTC',
      decimals: 8,
      address,
      hexPublicKey,
    }),
    toAddress: address,
    toAmount: amount.toString(),
    utxoInfo: [
      create(UtxoInfoSchema, {
        hash: 'ff'.repeat(32),
        amount: balance,
        index: 0,
      }),
    ],
    blockchainSpecific: {
      case: 'utxoSpecific',
      value: create(UTXOSpecificSchema, {
        sendMaxAmount,
        byteFee: byteFee.toString(),
      }),
    },
  })

// One 1,000,000-sat UTXO at 5 sat/vB: the send form estimates the fee with the
// whole balance, offers `balance - fee` as Max, and Verify signs that amount.
describe('UTXO Max send WalletCore integration', () => {
  let walletCore: WalletCore
  let publicKey: PublicKey

  beforeAll(async () => {
    walletCore = await initWasm()
    publicKey = walletCore.PublicKey.createWithData(
      Buffer.from(hexPublicKey, 'hex'),
      walletCore.PublicKeyType.secp256k1
    )
  })

  const getMaxAmount = async (byteFee = defaultByteFee) => {
    const estimatePayload = await refineKeysignUtxo({
      keysignPayload: getPayload({
        amount: balance,
        sendMaxAmount: false,
        byteFee,
      }),
      walletCore,
      publicKey,
    })
    const fee = await getFeeAmount({
      keysignPayload: estimatePayload,
      walletCore,
      publicKey,
    })

    return {
      fee,
      amount: getMaxSendableAmount({ chain: Chain.Bitcoin, balance, fee }),
    }
  }

  it('signs Max as a max spend and keeps the planned amount', async () => {
    const { fee, amount } = await getMaxAmount()
    const sendMaxAmount = isUtxoMaxSend({
      chain: Chain.Bitcoin,
      amount,
      balance,
      fee,
    })

    expect(amount).toBe(999_450n)
    expect(sendMaxAmount).toBe(true)

    const refined = await refineKeysignUtxo({
      keysignPayload: getPayload({ amount, sendMaxAmount }),
      walletCore,
      publicKey,
    })
    const reconciled = await reconcileUtxoPlanAmount({
      keysignPayload: refined,
      publicKey,
      walletCore,
    })

    expect(reconciled.toAmount).toBe('999450')
  })

  it('cannot sign the same amount as an ordinary send', async () => {
    const { amount } = await getMaxAmount()

    await expect(
      refineKeysignUtxo({
        keysignPayload: getPayload({ amount, sendMaxAmount: false }),
        walletCore,
        publicKey,
      })
    ).rejects.toThrow('insufficient balance')
  })

  it('sweeps what a higher fee chosen on Verify leaves of a Max amount', async () => {
    const { amount } = await getMaxAmount()
    const byteFee = 6n
    const { fee } = await getMaxAmount(byteFee)
    const sendMaxAmount = isUtxoMaxSend({
      chain: Chain.Bitcoin,
      amount,
      balance,
      fee,
    })

    expect(sendMaxAmount).toBe(true)

    const refined = await refineKeysignUtxo({
      keysignPayload: getPayload({ amount, sendMaxAmount, byteFee }),
      walletCore,
      publicKey,
    })
    const reconciled = await reconcileUtxoPlanAmount({
      keysignPayload: refined,
      publicKey,
      walletCore,
    })

    expect(reconciled.toAmount).toBe('999340')
  })
})
