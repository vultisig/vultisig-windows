import { UtxoChain } from '@core/chain/Chain'
import { utxoChainScriptType } from '@core/chain/chains/utxo/tx/UtxoScriptType'
import { getCoinType } from '@core/chain/coin/coinType'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { stripHexPrefix } from '@lib/utils/hex/stripHexPrefix'
import { match } from '@lib/utils/match'
import { matchDiscriminatedUnion } from '@lib/utils/matchDiscriminatedUnion'
import { TW } from '@trustwallet/wallet-core'
import Long from 'long'

import { GetTxInputDataInput } from './TxInputDataResolver'

export const getUtxoTxInputData = async ({
  keysignPayload,
  walletCore,
  chain,
  chainSpecific,
}: GetTxInputDataInput<'utxoSpecific'>) => {
  const { byteFee, sendMaxAmount } = chainSpecific

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

  const scriptKey = stripHexPrefix(walletCore.HexCoding.encode(pubKeyHash))

  const script = match(scriptType, {
    wpkh: () =>
      walletCore.BitcoinScript.buildPayToWitnessPubkeyHash(pubKeyHash).data(),
    pkh: () =>
      walletCore.BitcoinScript.buildPayToPublicKeyHash(pubKeyHash).data(),
  })

  const getAmount = () => {
    if ('swapPayload' in keysignPayload && keysignPayload.swapPayload.value) {
      return keysignPayload.swapPayload.value.fromAmount
    }

    return keysignPayload.toAmount
  }

  const getDestinationAddress = (): string => {
    if ('swapPayload' in keysignPayload && keysignPayload.swapPayload.value) {
      return matchDiscriminatedUnion(
        keysignPayload.swapPayload,
        'case',
        'value',
        {
          thorchainSwapPayload: payload => payload.vaultAddress,
          mayachainSwapPayload: payload => payload.vaultAddress,
          oneinchSwapPayload: () => {
            throw new Error('Oneinch swap not supported')
          },
        }
      )
    }
    return keysignPayload.toAddress
  }

  const input = TW.Bitcoin.Proto.SigningInput.create({
    hashType: walletCore.BitcoinScript.hashTypeForCoin(coinType),
    amount: Long.fromString(getAmount()),
    useMaxAmount: sendMaxAmount,
    toAddress: getDestinationAddress(),
    changeAddress: coin.address,
    byteFee: Long.fromString(byteFee),
    coinType: coinType.value,

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
    input.plan.branchId = Buffer.from('5510e7c8', 'hex')
  }

  return [TW.Bitcoin.Proto.SigningInput.encode(input).finish()]
}
