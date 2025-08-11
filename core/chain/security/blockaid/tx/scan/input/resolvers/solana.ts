import { getCoinType } from '@core/chain/coin/coinType'
import { productRootDomain } from '@core/config'
import { getKeysignSwapPayload } from '@core/mpc/keysign/swap/getKeysignSwapPayload'
import { getKeysignTwPublicKey } from '@core/mpc/keysign/tw/getKeysignTwPublicKey'
import { getSolanaSendTxInputData } from '@core/mpc/keysign/txInputData/solana/send'
import { assertField } from '@lib/utils/record/assertField'

import { OtherChain } from '../../../../../../Chain'
import { decodeTx } from '../../../../../../tx/decode'
import { BlockaidTxScanInputResolver } from '../resolver'

export const getSolanaBlockaidTxScanInput: BlockaidTxScanInputResolver<
  OtherChain.Solana
> = ({ payload, walletCore, chain }) => {
  const coin = assertField(payload, 'coin')

  const swapPayload = getKeysignSwapPayload(payload)

  if (swapPayload) {
    return null
  }

  const txInputData = getSolanaSendTxInputData({
    keysignPayload: payload,
    walletCore,
  })

  const publicKeyData = getKeysignTwPublicKey(payload)
  const publicKey = walletCore.PublicKey.createWithData(
    publicKeyData,
    walletCore.PublicKeyType.ed25519
  )

  const allSignatures = walletCore.DataVector.create()
  const publicKeys = walletCore.DataVector.create()

  allSignatures.add(Buffer.from('0'.repeat(128), 'hex'))
  publicKeys.add(publicKey.data())

  const coinType = getCoinType({
    chain,
    walletCore,
  })

  const compiledTx = walletCore.TransactionCompiler.compileWithSignatures(
    coinType,
    txInputData,
    allSignatures,
    publicKeys
  )

  const { encoded } = decodeTx({
    chain,
    compiledTx,
  })

  return {
    chain: 'mainnet',
    metadata: { url: productRootDomain },
    options: ['validation'],
    account_address: coin.address,
    encoding: 'base58',
    transactions: [encoded],
    method: 'signAndSendTransaction',
  }
}
