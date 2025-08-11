import { getCoinType } from '@core/chain/coin/coinType'
import { getKeysignTwPublicKey } from '@core/mpc/keysign/tw/getKeysignTwPublicKey'
import { getSuiTxInputData } from '@core/mpc/keysign/txInputData/sui'
import { assertField } from '@lib/utils/record/assertField'

import { OtherChain } from '../../../../../../Chain'
import { decodeTx } from '../../../../../../tx/decode'
import { BlockaidTxScanInputResolver } from '../resolver'

export const getSuiBlockaidTxScanInput: BlockaidTxScanInputResolver<
  OtherChain.Sui
> = ({ payload, walletCore }) => {
  const coin = assertField(payload, 'coin')

  const [txInputData] = getSuiTxInputData({
    keysignPayload: payload,
    walletCore,
    chain: OtherChain.Sui,
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
    chain: OtherChain.Sui,
    walletCore,
  })

  const compiledTx = walletCore.TransactionCompiler.compileWithSignatures(
    coinType,
    txInputData,
    allSignatures,
    publicKeys
  )

  const { unsignedTx } = decodeTx({
    chain: OtherChain.Sui,
    compiledTx,
  })

  return {
    chain: 'mainnet',
    options: ['validation'],
    account_address: coin.address,
    transaction: unsignedTx as unknown as string,
  }
}
