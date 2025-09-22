import { UtxoChain } from '@core/chain/Chain'
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
import { GetTxInputDataInput } from '../resolver'

export const getUtxoTxInputData = ({
  keysignPayload,
  walletCore,
  chain,
  publicKey,
}: GetTxInputDataInput<'utxo'>) => {
  const { byteFee, sendMaxAmount, psbt } = getBlockchainSpecificValue(
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

  let signingV2 = undefined
  if (psbt) {
    if (!publicKey) {
      throw new Error('Public key is required')
    }
    const pub33 = publicKey.data()
    if (pub33.length !== 33) {
      throw new Error(
        `Expected compressed secp256k1 pubkey (33 bytes), got ${pub33.length}`
      )
    }
    const hrpEnum = walletCore.CoinTypeExt.hrp(coinType)
    const hrpMap: Record<number, string> = {
      [walletCore.HRP.bitcoin.value]: 'bc',
      [walletCore.HRP.litecoin.value]: 'ltc',
    }

    const chainInfo = TW.BitcoinV2.Proto.ChainInfo.create({
      p2pkhPrefix: walletCore.CoinTypeExt.p2pkhPrefix(coinType),
      p2shPrefix: walletCore.CoinTypeExt.p2shPrefix(coinType),
      hrp: hrpMap[hrpEnum.value], // ok if undefined for other coins
    })
    const psbtBytes = Uint8Array.from(Buffer.from(psbt, 'base64'))

    signingV2 = {
      psbt: TW.BitcoinV2.Proto.Psbt.create({
        psbt: psbtBytes,
      }),
      publicKeys: [publicKey.data()],
      chainInfo,
    }
  }
  const input = TW.Bitcoin.Proto.SigningInput.create({
    hashType: walletCore.BitcoinScript.hashTypeForCoin(coinType),
    amount: Long.fromString(amount),
    useMaxAmount: sendMaxAmount,
    toAddress: destinationAddress,
    changeAddress: coin.address,
    byteFee: Long.fromString(byteFee),
    coinType: coinType.value,
    scripts: {
      [scriptKey]: script,
    },
    signingV2: signingV2,
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
