import { getKeysignTwPublicKey } from '@core/mpc/keysign/tw/getKeysignTwPublicKey'
import { getTxInputData } from '@core/mpc/keysign/txInputData'
import { getKeysignChain } from '@core/mpc/keysign/utils/getKeysignChain'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { WalletCore } from '@trustwallet/wallet-core'

import { getCoinType } from '../../../../../coin/coinType'

type Input = {
  payload: KeysignPayload
  walletCore: WalletCore
}

export const getCompiledTxsForBlockaidInput = ({
  payload,
  walletCore,
}: Input) => {
  return getTxInputData({
    keysignPayload: payload,
    walletCore,
  }).map(txInputData => {
    const publicKeyData = getKeysignTwPublicKey(payload)
    const publicKey = walletCore.PublicKey.createWithData(
      publicKeyData,
      walletCore.PublicKeyType.ed25519
    )

    const coinType = getCoinType({
      chain: getKeysignChain(payload),
      walletCore,
    })

    return walletCore.TransactionCompiler.compileWithSignatures(
      coinType,
      txInputData,
      walletCore.DataVector.createWithData(Buffer.from('0'.repeat(128), 'hex')),
      walletCore.DataVector.createWithData(publicKey.data())
    )
  })
}
