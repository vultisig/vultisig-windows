import { handleSendTransaction } from '@clients/extension/src/background/handlers/transactionsHandler'
import { ThorchainProviderResponse } from '@clients/extension/src/types/thorchain'
import { RequestMethod } from '@clients/extension/src/utils/constants'
import {
  ITransaction,
  Messaging,
  TransactionDetails,
  TransactionType,
} from '@clients/extension/src/utils/interfaces'
import {
  getStandardTransactionDetails,
  isBasicTransaction,
} from '@clients/extension/src/utils/tx/getStandardTx'
import { Chain } from '@core/chain/Chain'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

export const handleRequest = (
  body: Messaging.Chain.Request,
  chain: Chain
): Promise<Messaging.Chain.Response | ThorchainProviderResponse> => {
  return new Promise((resolve, reject) => {
    const { method, params } = body

    switch (method) {
      case RequestMethod.VULTISIG.SEND_TRANSACTION: {
        const [_transaction] = params
        if (chain === Chain.Solana && _transaction.serializedTx) {
          handleSendTransaction({
            transactionPayload: {
              serialized: {
                data: _transaction.serializedTx,
                skipBroadcast: _transaction.skipBroadcast,
                chain,
              },
            },
            status: 'default',
          })
            .then(result => resolve(result))
            .catch(reject)
        } else {
          const isBasic = isBasicTransaction(_transaction)
          getStandardTransactionDetails(
            {
              ..._transaction,
              txType: isBasic
                ? 'MetaMask'
                : (_transaction.txType ?? 'Vultisig'),
            } as TransactionType.WalletTransaction,
            chain
          ).then(standardTx => {
            const modifiedTransaction: ITransaction = {
              transactionPayload: {
                keysign: {
                  transactionDetails: standardTx as TransactionDetails,
                  chain,
                },
              },
              status: 'default',
            }
            handleSendTransaction(modifiedTransaction)
              .then(result => resolve(result))
              .catch(reject)
          })
        }
        break
      }
      case RequestMethod.METAMASK.ETH_SEND_TRANSACTION: {
        if (Array.isArray(params)) {
          const [_transaction] = params as TransactionType.MetaMask[]

          if (_transaction) {
            getStandardTransactionDetails(
              {
                ..._transaction,
                txType: 'MetaMask',
              } as TransactionType.MetaMask,
              chain
            ).then(standardTx => {
              const modifiedTransaction: ITransaction = {
                transactionPayload: {
                  keysign: {
                    transactionDetails: standardTx!,
                    chain,
                  },
                },
                status: 'default',
              }
              handleSendTransaction(modifiedTransaction)
                .then(result => resolve(result))
                .catch(reject)
            })
          } else {
            reject()
          }
        } else {
          reject()
        }

        break
      }
      case RequestMethod.VULTISIG.DEPOSIT_TRANSACTION: {
        if (Array.isArray(params)) {
          const [transaction] = params as TransactionType.Vultisig[]
          if (transaction) {
            const isBasic = isBasicTransaction(transaction)

            getStandardTransactionDetails(
              {
                ...transaction,
                txType: isBasic
                  ? 'MetaMask'
                  : (transaction.txType ?? 'Vultisig'),
              } as TransactionType.WalletTransaction,
              chain
            ).then(standardTx => {
              const modifiedTransaction: ITransaction = {
                transactionPayload: {
                  keysign: {
                    transactionDetails: standardTx as TransactionDetails,
                    chain,
                    isDeposit: true,
                  },
                },
                status: 'default',
              }
              handleSendTransaction(modifiedTransaction)
                .then(result => resolve(result))
                .catch(reject)
            })
          } else {
            reject()
          }
        } else {
          reject()
        }

        break
      }
      case RequestMethod.CTRL.DEPOSIT: {
        if (Array.isArray(params)) {
          const [_transaction] = params as TransactionType.Ctrl[]

          if (_transaction) {
            getStandardTransactionDetails(
              { ..._transaction, txType: 'Ctrl' },
              chain
            ).then(standardTx => {
              const tx: ITransaction = {
                transactionPayload: {
                  keysign: {
                    transactionDetails: standardTx,
                    chain,
                    isDeposit: true,
                  },
                },
                status: 'default',
              }
              handleSendTransaction(tx)
                .then(result => resolve(result))
                .catch(reject)
            })
          } else {
            reject()
          }
        } else {
          reject()
        }

        break
      }
      case RequestMethod.CTRL.TRANSFER: {
        if (Array.isArray(params)) {
          const [_transaction] = params as TransactionType.Ctrl[]

          if (_transaction) {
            getStandardTransactionDetails(
              { ..._transaction, txType: 'Ctrl' },
              chain
            ).then(standardTx => {
              const tx: ITransaction = {
                transactionPayload: {
                  keysign: {
                    transactionDetails: standardTx,
                    chain,
                  },
                },
                status: 'default',
              }
              handleSendTransaction(tx)
                .then(result => resolve(result))
                .catch(reject)
            })
          } else {
            reject()
          }
        } else {
          reject()
        }

        break
      }
      case RequestMethod.CTRL.SIGN_PSBT: {
        if (Array.isArray(params)) {
          const [{ psbt }] = params
          handleSendTransaction({
            transactionPayload: {
              serialized: {
                data: psbt,
                chain,
              },
            },
            status: 'default',
          }).then(result => {
            resolve(shouldBePresent(result))
          })
        }
        break
      }
      default: {
        reject(`Unsupported method: ${method}`)

        break
      }
    }
  })
}
