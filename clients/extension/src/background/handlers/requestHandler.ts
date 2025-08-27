import { handleSendTransaction } from '@clients/extension/src/background/handlers/transactionsHandler'
import {
  ThorchainProviderMethod,
  ThorchainProviderResponse,
} from '@clients/extension/src/types/thorchain'
import api from '@clients/extension/src/utils/api'
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
import { getCosmosClient } from '@core/chain/chains/cosmos/client'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { ensureHexPrefix } from '@lib/utils/hex/ensureHexPrefix'
import { getBytes, isHexString, Signature, TypedDataEncoder } from 'ethers'

import { safeJsonStringify } from '../utils/bigIntUtils'

export const handleRequest = (
  body: Messaging.Chain.Request,
  chain: Chain
): Promise<
  Messaging.Chain.Response | ThorchainProviderResponse<ThorchainProviderMethod>
> => {
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
      case RequestMethod.VULTISIG.GET_TRANSACTION_BY_HASH: {
        if (Array.isArray(params)) {
          const [hash] = params

          if (hash) {
            switch (chain) {
              // Thor
              case Chain.THORChain: {
                api.thorchain
                  .getTransactionByHash(String(hash))
                  .then(resolve)
                  .catch(reject)

                break
              }
              // Cosmos
              case Chain.Dydx:
              case Chain.Cosmos:
              case Chain.Kujira:
              case Chain.MayaChain:
              case Chain.Osmosis: {
                getCosmosClient(chain)
                  .then(client => {
                    client
                      .getTx(String(hash))
                      .then(result => resolve(safeJsonStringify(result)))
                  })
                  .catch(error =>
                    reject(`Could not initialize Tendermint Client: ${error}`)
                  )

                break
              }
              default: {
                api.utxo
                  .blockchairGetTx(chain, String(hash))
                  .then(res => resolve(safeJsonStringify(res)))
                  .catch(reject)

                break
              }
            }
          } else {
            reject()
          }
        } else {
          reject()
        }

        break
      }

      case RequestMethod.METAMASK.ETH_SIGN_TYPED_DATA_V4: {
        if (Array.isArray(params)) {
          try {
            const [address, rawMsgParams] = params
            let msgParams: any
            try {
              msgParams = JSON.parse(String(rawMsgParams))
            } catch {
              msgParams = rawMsgParams
            }

            const { domain, types, message } = msgParams

            // Remove EIP712Domain if present — ethers handles it internally
            if (types?.EIP712Domain) {
              delete types.EIP712Domain
            }

            const hashMessage = TypedDataEncoder.encode(domain, types, message)
            handleSendTransaction({
              transactionPayload: {
                custom: {
                  method,
                  address: String(address),
                  message: hashMessage,
                },
              },
              status: 'default',
            })
              .then(result => {
                let sig = Signature.from(
                  ensureHexPrefix(shouldBePresent(result.hash))
                )
                if (sig.v < 27) {
                  sig = Signature.from({
                    r: sig.r,
                    s: sig.s,
                    v: sig.v + 27,
                  })
                }
                resolve(ensureHexPrefix(sig.serialized))
              })
              .catch(error => {
                reject(error)
              })
          } catch (error) {
            reject(error)
          }
        } else {
          reject(new Error('Invalid parameters'))
        }
        break
      }

      case RequestMethod.METAMASK.PERSONAL_SIGN: {
        if (Array.isArray(params)) {
          const [message, address] = params

          let messageBytes: Uint8Array
          if (typeof message === 'string' && isHexString(message)) {
            messageBytes = getBytes(message)
          } else {
            messageBytes = new TextEncoder().encode(String(message))
          }

          const prefix = `\x19Ethereum Signed Message:\n${messageBytes.length}`
          const fullMessage = prefix + new TextDecoder().decode(messageBytes)

          handleSendTransaction({
            transactionPayload: {
              custom: {
                method,
                address: String(address),
                message: fullMessage,
                chain: chain,
                prefix,
              },
            },
            status: 'default',
          })
            .then(result => {
              let sig = Signature.from(
                ensureHexPrefix(shouldBePresent(result.hash))
              )
              if (sig.v < 27) {
                sig = Signature.from({
                  r: sig.r,
                  s: sig.s,
                  v: sig.v + 27,
                })
              }
              resolve(ensureHexPrefix(sig.serialized))
            })
            .catch(reject)
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
      case RequestMethod.CTRL.SIGN_MESSAGE: {
        if (Array.isArray(params)) {
          const [{ message }] = params
          handleSendTransaction({
            transactionPayload: {
              custom: {
                method,
                address: '',
                message: message,
                chain: chain,
              },
            },
            status: 'default',
          }).then(result => {
            resolve(shouldBePresent(result.hash))
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
