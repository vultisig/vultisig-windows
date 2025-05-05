import {
  SendTransactionResponse,
  SignedTransaction,
} from '@clients/extension/src/utils/interfaces'
import { getSignedTx } from '@clients/extension/src/utils/tx/sign'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { compileTx } from '@core/chain/tx/compile/compileTx'

export const getSignedTransaction = ({
  inputData,
  signatures,
  transaction,
  vault,
  walletCore,
}: SignedTransaction): Promise<SendTransactionResponse> => {
  return new Promise((resolve, reject) => {
    if (inputData && vault && transaction) {
      const pubkey = getPublicKey({
        chain: transaction.chain,
        walletCore,
        hexChainCode: vault.hexChainCode,
        publicKeys: vault.publicKeys,
      })

      if (pubkey) {
        const compiledTx = compileTx({
          txInputData: inputData,
          chain: transaction?.chain,
          publicKey: pubkey,
          signatures,
          walletCore: walletCore,
        })

        getSignedTx({
          chain: transaction.chain,
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
