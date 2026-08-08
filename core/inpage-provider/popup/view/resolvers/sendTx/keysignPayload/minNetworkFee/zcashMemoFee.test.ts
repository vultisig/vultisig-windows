/**
 * WalletCore's planner charges an OP_RETURN output as a fixed ~34 bytes
 * regardless of memo length, while ZIP-317 charges ~one logical action per
 * 34 memo bytes — so memo sends can plan below the conventional fee.
 * Exercises the real planner to pin the quirk and the byteFee-mode bump the
 * SDK signing-input resolver (getUtxoSigningInputs) uses to compensate: in
 * WalletCore's zip_0317 mode byteFee is ignored, so the resolver re-plans with
 * zip_0317 off — where (as below) raising byteFee raises the fee.
 */
import { initWasm, TW, WalletCore } from '@trustwallet/wallet-core'
import {
  ceilDiv,
  getZcashConventionalFee,
} from '@vultisig/core-chain/chains/utxo/fee/zip317'
import Long from 'long'
import { beforeAll, describe, expect, it } from 'vitest'

const zcashAddress = 't1PoLLLwEcVhqMBhk53tANtSepnPXAQJkPM'

type PlanZcashSendInput = {
  walletCore: WalletCore
  byteFee: bigint
  memoLength: number
}

const planZcashSend = ({
  walletCore,
  byteFee,
  memoLength,
}: PlanZcashSendInput): bigint => {
  const coinType = walletCore.CoinType.zcash
  const lockScript = walletCore.BitcoinScript.lockScriptForAddress(
    zcashAddress,
    coinType
  )
  const input = TW.Bitcoin.Proto.SigningInput.create({
    hashType: walletCore.BitcoinScript.hashTypeForCoin(coinType),
    amount: Long.fromString('100000'),
    useMaxAmount: false,
    toAddress: zcashAddress,
    changeAddress: zcashAddress,
    byteFee: Long.fromString(byteFee.toString()),
    coinType: coinType.value,
    utxo: [
      TW.Bitcoin.Proto.UnspentTransaction.create({
        amount: Long.fromString('10000000'),
        outPoint: TW.Bitcoin.Proto.OutPoint.create({
          hash: new Uint8Array(32).fill(0xff),
          index: 0,
          sequence: 0xffffffff,
        }),
        script: lockScript.data(),
      }),
    ],
  })
  if (memoLength > 0) {
    input.outputOpReturn = new TextEncoder().encode('m'.repeat(memoLength))
  }
  const encoded = TW.Bitcoin.Proto.SigningInput.encode(input).finish()
  const plan = TW.Bitcoin.Proto.TransactionPlan.decode(
    walletCore.AnySigner.plan(encoded, coinType)
  )

  return BigInt(plan.fee.toString())
}

const getConventionalFee = (memoLength: number): bigint =>
  getZcashConventionalFee({
    inputCount: 1,
    outputSizes: [34n, 34n, 11n + 1n + BigInt(memoLength)],
  })

describe('Zcash memo sends vs ZIP-317', () => {
  let walletCore: WalletCore

  beforeAll(async () => {
    walletCore = await initWasm()
  })

  it('pins the WalletCore quirk: plan fee is flat across memo sizes', () => {
    const fee80 = planZcashSend({ walletCore, byteFee: 100n, memoLength: 80 })
    const fee200 = planZcashSend({ walletCore, byteFee: 100n, memoLength: 200 })

    // If this ever fails, WalletCore started sizing OP_RETURN correctly —
    // re-evaluate whether the SDK resolver's conventional-fee bump still fires.
    expect(fee80).toBe(fee200)
  })

  it('underpays ZIP-317 at 100 sats/byte once the memo reaches ~120 bytes', () => {
    const planFee = planZcashSend({
      walletCore,
      byteFee: 100n,
      memoLength: 120,
    })

    expect(planFee).toBeLessThan(getConventionalFee(120))
  })

  it('meets the conventional fee after one planner-ratio bump', () => {
    const byteFee = 100n
    const memoLength = 120
    const planFee = planZcashSend({ walletCore, byteFee, memoLength })
    const conventionalFee = getConventionalFee(memoLength)

    const plannerVsize = planFee / byteFee
    const bumpedByteFee = ceilDiv({
      value: conventionalFee,
      divisor: plannerVsize,
    })
    const bumpedFee = planZcashSend({
      walletCore,
      byteFee: bumpedByteFee,
      memoLength,
    })

    expect(bumpedFee).toBeGreaterThanOrEqual(conventionalFee)
  })
})
