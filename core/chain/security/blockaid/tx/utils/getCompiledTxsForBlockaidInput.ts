import { getChainKind } from '@core/chain/ChainKind'
import { getCoinType } from '@core/chain/coin/coinType'
import { getTwPublicKeyType } from '@core/chain/publicKey/tw/getTwPublicKeyType'
import { getPreSigningHashes } from '@core/chain/tx/preSigningHashes'
import { getEncodedSigningInputs } from '@core/mpc/keysign/signingInputs'
import { getKeysignTwPublicKey } from '@core/mpc/keysign/tw/getKeysignTwPublicKey'
import { getKeysignChain } from '@core/mpc/keysign/utils/getKeysignChain'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { match } from '@lib/utils/match'
import { WalletCore } from '@trustwallet/wallet-core'

import { signatureFormats } from '../../../../signing/SignatureFormat'

type Input = {
  payload: KeysignPayload
  walletCore: WalletCore
}

export const getCompiledTxsForBlockaidInput = ({
  payload,
  walletCore,
}: Input) => {
  const chain = getKeysignChain(payload)
  const chainKind = getChainKind(chain)

  const publicKeyData = getKeysignTwPublicKey(payload)
  const publicKey = walletCore.PublicKey.createWithData(
    publicKeyData,
    getTwPublicKeyType({ walletCore, chain })
  )

  const coinType = getCoinType({
    chain,
    walletCore,
  })

  const inputs = getEncodedSigningInputs({
    keysignPayload: payload,
    walletCore,
    publicKey,
  })

  return inputs.map(txInputData => {
    const preHashes = getPreSigningHashes({
      walletCore,
      txInputData,
      chain,
    })

    const signatures = walletCore.DataVector.create()
    const publicKeys = walletCore.DataVector.create()

    preHashes.forEach(msg =>
      match(signatureFormats[chainKind], {
        raw: () => {
          signatures.add(Buffer.alloc(64, 0))
          publicKeys.add(publicKey.data())
        },
        rawWithRecoveryId: () => {
          signatures.add(Buffer.alloc(65, 0))
          publicKeys.add(publicKey.data())
        },
        der: () => {
          const privateKey = walletCore.PrivateKey.create()

          signatures.add(Buffer.from(privateKey.signAsDER(msg)))
          publicKeys.add(privateKey.getPublicKeySecp256k1(true).data())
        },
      })
    )

    return walletCore.TransactionCompiler.compileWithSignatures(
      coinType,
      txInputData,
      signatures,
      publicKeys
    )
  })
}
