import { UtxoChain } from '@core/chain/Chain'
import { minUtxo } from '@core/chain/chains/utxo/minUtxo'
import { utxoChainScriptType } from '@core/chain/chains/utxo/tx/UtxoScriptType'
import { getCoinType } from '@core/chain/coin/coinType'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { match } from '@lib/utils/match'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { TW } from '@trustwallet/wallet-core'
import Long from 'long'

import { getBlockchainSpecificValue } from '../../chainSpecific/KeysignChainSpecific'
import { getKeysignSwapPayload } from '../../swap/getKeysignSwapPayload'
import { KeysignSwapPayload } from '../../swap/KeysignSwapPayload'
import { getKeysignChain } from '../../utils/getKeysignChain'
import { SigningInputsResolver } from '../resolver'

export const getUtxoSigningInputs: SigningInputsResolver<'utxo'> = ({
  keysignPayload,
  walletCore,
}) => {
  const chain = getKeysignChain<'utxo'>(keysignPayload)

  const { byteFee, sendMaxAmount } = getBlockchainSpecificValue(
    keysignPayload.blockchainSpecific,
    'utxoSpecific'
  )

  const coin = shouldBePresent(keysignPayload.coin)

  const coinType = getCoinType({
    walletCore,
    chain,
  })

  const lockScript = walletCore.BitcoinScript.lockScriptForAddress(
    coin.address,
    coinType
  )

  const scriptType = utxoChainScriptType[chain]

  const pubKeyHash = match(scriptType, {
    wpkh: () => lockScript.matchPayToWitnessPublicKeyHash(),
    pkh: () => lockScript.matchPayToPubkeyHash(),
  })

  const scriptKey = Buffer.from(pubKeyHash).toString('hex')

  const script = match(scriptType, {
    wpkh: () =>
      walletCore.BitcoinScript.buildPayToWitnessPubkeyHash(pubKeyHash).data(),
    pkh: () =>
      walletCore.BitcoinScript.buildPayToPublicKeyHash(pubKeyHash).data(),
  })

  const swapPayload = getKeysignSwapPayload(keysignPayload)
  const amount = swapPayload
    ? getRecordUnionValue(swapPayload).fromAmount
    : keysignPayload.toAmount

  const destinationAddress = swapPayload
    ? matchRecordUnion<KeysignSwapPayload, string>(swapPayload, {
        native: swapPayload => swapPayload.vaultAddress,
        general: () => {
          throw new Error('General swap not supported')
        },
      })
    : keysignPayload.toAddress

  const input = TW.Bitcoin.Proto.SigningInput.create({
    hashType: walletCore.BitcoinScript.hashTypeForCoin(coinType),
    amount: Long.fromString(amount),
    useMaxAmount: sendMaxAmount,
    toAddress: destinationAddress,
    changeAddress: coin.address,
    byteFee: Long.fromString(byteFee),
    coinType: coinType.value,
    fixedDustThreshold: Long.fromBigInt(minUtxo[chain]),
    scripts: {
      [scriptKey]: script,
    },
    utxo: keysignPayload.utxoInfo.map(({ hash, amount, index }) =>
      TW.Bitcoin.Proto.UnspentTransaction.create({
        amount: Long.fromString(amount.toString()),
        outPoint: TW.Bitcoin.Proto.OutPoint.create({
          hash: walletCore.HexCoding.decode(hash).reverse(),
          index: index,
          sequence: 0xffffffff,
        }),
        script: lockScript.data(),
      })
    ),
  })

  if (keysignPayload.memo) {
    const encoder = new TextEncoder()
    input.outputOpReturn = encoder.encode(keysignPayload.memo)
  }

  const inputData = TW.Bitcoin.Proto.SigningInput.encode(input).finish()

  const plan = walletCore.AnySigner.plan(inputData, coinType)

  input.plan = TW.Bitcoin.Proto.TransactionPlan.decode(plan)

  if (chain === UtxoChain.Zcash) {
    input.plan.branchId = Buffer.from('f04dec4d', 'hex')
  }

  return [input]
}
