import { UtxoChain } from '@core/chain/Chain'
import { minUtxo } from '@core/chain/chains/utxo/minUtxo'
import { utxoChainScriptType } from '@core/chain/chains/utxo/tx/UtxoScriptType'
import { getCoinType } from '@core/chain/coin/coinType'
import { UtxoInfo } from '@core/mpc/types/vultisig/keysign/v1/utxo_info_pb'
import { match } from '@lib/utils/match'
import { TW } from '@trustwallet/wallet-core'
import {
  PublicKey,
  WalletCore,
} from '@trustwallet/wallet-core/dist/src/wallet-core'
import Long from 'long'

import { AccountCoinKey } from '../../../coin/AccountCoin'

type GetUtxoTxSigningInputInput = {
  publicKey: PublicKey
  coin: AccountCoinKey<UtxoChain>
  walletCore: WalletCore
  byteFee: bigint
  sendMaxAmount: boolean
  psbt?: string
  amount?: bigint
  receiver?: string
  utxoInfo: UtxoInfo[]
  memo?: string
}

export const getUtxoTxSigningInput = ({
  walletCore,
  coin,
  publicKey,
  amount,
  sendMaxAmount,
  psbt,
  byteFee,
  receiver,
  utxoInfo,
  memo,
}: GetUtxoTxSigningInputInput) => {
  const { chain } = coin
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
    amount: amount ? Long.fromBigInt(amount) : undefined,
    useMaxAmount: sendMaxAmount,
    toAddress: receiver,
    changeAddress: coin.address,
    byteFee: Long.fromBigInt(byteFee),
    coinType: coinType.value,
    fixedDustThreshold: Long.fromBigInt(minUtxo[chain]),
    scripts: {
      [scriptKey]: script,
    },
    signingV2: signingV2,
    utxo: utxoInfo.map(({ hash, amount, index }) =>
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

  if (memo) {
    const encoder = new TextEncoder()
    input.outputOpReturn = encoder.encode(memo)
  }

  const inputData = TW.Bitcoin.Proto.SigningInput.encode(input).finish()

  const plan = walletCore.AnySigner.plan(inputData, coinType)

  input.plan = TW.Bitcoin.Proto.TransactionPlan.decode(plan)

  if (chain === UtxoChain.Zcash) {
    input.plan.branchId = Buffer.from('5510e7c8', 'hex')
  }

  return input
}
