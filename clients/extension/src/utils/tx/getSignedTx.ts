import { getChainKind } from '@core/chain/ChainKind'
import { signatureAlgorithms } from '@core/chain/signing/SignatureAlgorithm'
import { compileTx } from '@core/chain/tx/compile/compileTx'
import { match } from '@lib/utils/match'

import { SendTransactionResponse, SignedTransaction } from '../interfaces'
import { getSignedTx } from './sign'

export const getSignedTransaction = ({
  inputData,
  signatures,
  transaction,
  vault,
  walletCore,
}: SignedTransaction): Promise<SendTransactionResponse> => {
  return new Promise((resolve, reject) => {
    if (inputData && vault && transaction) {
      const derivationKey = vault.chains.find(
        chain => chain.chain === transaction.chain.chain
      )?.derivationKey
      if (!derivationKey) {
        return reject('Derivation key not found for the specified chain')
      }
      const keysignType =
        signatureAlgorithms[getChainKind(transaction.chain.chain)]

      const publicKeyType = match(keysignType, {
        ecdsa: () => walletCore.PublicKeyType.secp256k1,
        eddsa: () => walletCore.PublicKeyType.ed25519,
      })

      const pubkey = walletCore.PublicKey.createWithData(
        Buffer.from(derivationKey, 'hex'),
        publicKeyType
      )

      if (pubkey) {
        const compiledTx = compileTx({
          txInputData: inputData,
          chain: transaction?.chain.chain,
          publicKey: pubkey,
          signatures,
          walletCore: walletCore,
        })

        getSignedTx({
          chain: transaction.chain.chain,
          compiledTx,
        })
          .then(result => resolve(result as SendTransactionResponse))
          .catch(reject)
      } else {
        reject('Chain Not Supported')
      }
    } else {
      reject('Missing required parameters: inputData, vault, or transaction')
    }
  })
}
