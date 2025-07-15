import {
  handleFindAccounts,
  handleGetAccounts,
} from '@clients/extension/src/background/handlers/accountsHandler'
import { EIP1193Error } from '@clients/extension/src/background/handlers/errorHandler'
import { handleSendTransaction } from '@clients/extension/src/background/handlers/transactionsHandler'
import { initializeMessenger } from '@clients/extension/src/messengers/initializeMessenger'
import {
  getVaultsAppSessions,
  setVaultsAppSessions,
  updateAppSession,
  VaultsAppSessions,
} from '@clients/extension/src/sessions/state/appSessions'
import { storage } from '@clients/extension/src/storage'
import { setCurrentCosmosChainId } from '@clients/extension/src/storage/currentCosmosChainId'
import { setCurrentEVMChainId } from '@clients/extension/src/storage/currentEvmChainId'
import {
  ThorchainProviderMethod,
  ThorchainProviderResponse,
} from '@clients/extension/src/types/thorchain'
import api from '@clients/extension/src/utils/api'
import {
  getDappHost,
  getDappHostname,
} from '@clients/extension/src/utils/connectedApps'
import {
  EventMethod,
  RequestMethod,
} from '@clients/extension/src/utils/constants'
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
import { Chain, CosmosChain, EvmChain } from '@core/chain/Chain'
import { getChainKind } from '@core/chain/ChainKind'
import {
  getCosmosChainByChainId,
  getCosmosChainId,
} from '@core/chain/chains/cosmos/chainInfo'
import { getCosmosClient } from '@core/chain/chains/cosmos/client'
import {
  evmChainRpcUrls,
  getEvmChainByChainId,
  getEvmChainId,
} from '@core/chain/chains/evm/chainInfo'
import { getEvmClient } from '@core/chain/chains/evm/client'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { ensureHexPrefix } from '@lib/utils/hex/ensureHexPrefix'
import { memoize } from '@lib/utils/memoize'
import {
  getBytes,
  isHexString,
  JsonRpcProvider,
  Signature,
  TransactionRequest,
  TypedDataEncoder,
} from 'ethers'

import { safeJsonStringify } from '../utils/bigIntUtils'

const getEvmRpcProvider = memoize(
  (chain: EvmChain) => new JsonRpcProvider(evmChainRpcUrls[chain])
)

const inpageMessenger = initializeMessenger({ connect: 'inpage' })

export const handleRequest = (
  body: Messaging.Chain.Request,
  chain: Chain,
  sender: string
): Promise<
  Messaging.Chain.Response | ThorchainProviderResponse<ThorchainProviderMethod>
> => {
  return new Promise((resolve, reject) => {
    const { method, params } = body

    switch (method) {
      case RequestMethod.VULTISIG.GET_ACCOUNTS:
      case RequestMethod.METAMASK.ETH_ACCOUNTS: {
        handleFindAccounts(chain, sender)
          .then(([account]) => {
            switch (chain) {
              case Chain.Dydx:
              case Chain.Cosmos:
              case Chain.Kujira:
              case Chain.Osmosis:
              case Chain.Solana: {
                resolve(account)

                break
              }
              default: {
                resolve(account ? [account] : [])

                break
              }
            }
          })
          .catch(reject)

        break
      }

      case RequestMethod.VULTISIG.REQUEST_ACCOUNTS:
      case RequestMethod.METAMASK.ETH_REQUEST_ACCOUNTS: {
        handleGetAccounts(chain, sender)
          .then(([account]) => {
            if (!account) throw new EIP1193Error(4001)

            if (getChainKind(chain) === 'evm') {
              inpageMessenger.send(
                `${EventMethod.ACCOUNTS_CHANGED}:${getDappHost(sender)}`,
                account
              )
              try {
                inpageMessenger.send(
                  `${EventMethod.CONNECT}:${getDappHost(sender)}`,
                  {
                    address: account,
                    chainId: getEvmChainId(chain as EvmChain),
                  }
                )
              } catch (err) {
                console.log('background err send to inpage:', err)
              }
            }

            const specialChains = [
              Chain.Dydx,
              Chain.Cosmos,
              Chain.Kujira,
              Chain.Osmosis,
              Chain.Solana,
            ] as Chain[]

            resolve(specialChains.includes(chain) ? account : [account])
          })
          .catch(reject)

        break
      }
      case RequestMethod.VULTISIG.CHAIN_ID:
      case RequestMethod.METAMASK.ETH_CHAIN_ID: {
        let chainId: string | undefined = undefined

        if (getChainKind(chain) === 'evm') {
          chainId = getEvmChainId(chain as EvmChain)
        } else if (getChainKind(chain) === 'cosmos') {
          chainId = getCosmosChainId(chain as CosmosChain)
        }

        if (chainId) resolve(chainId)
        else reject()

        break
      }
      case RequestMethod.VULTISIG.SEND_TRANSACTION: {
        const [_transaction] = params
        if (chain === Chain.Solana && _transaction.serializedTx) {
          handleSendTransaction({
            transactionPayload: { serialized: _transaction.serializedTx },
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
      case RequestMethod.VULTISIG.GET_TRANSACTION_BY_HASH:
      case RequestMethod.METAMASK.ETH_GET_TRANSACTION_BY_HASH: {
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
              // EVM
              case Chain.Avalanche:
              case Chain.Arbitrum:
              case Chain.Base:
              case Chain.BSC:
              case Chain.CronosChain:
              case Chain.Ethereum:
              case Chain.Optimism:
              case Chain.Polygon: {
                const client = getEvmClient(chain)
                client
                  .getTransaction({ hash: String(hash) as `0x${string}` })
                  .then(result => resolve(safeJsonStringify(result)))
                  .catch(reject)

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
      case RequestMethod.METAMASK.ETH_GET_TRANSACTION_COUNT: {
        const [address, tag] = params
        getEvmRpcProvider(chain as EvmChain)
          .getTransactionCount(String(address), String(tag))
          .then(count => resolve(String(count)))
          .catch(reject)
        break
      }
      case RequestMethod.METAMASK.ETH_BLOCK_NUMBER: {
        getEvmRpcProvider(chain as EvmChain)
          .getBlock('latest')
          .then(block => resolve(String(block?.number)))
          .catch(reject)

        break
      }
      case RequestMethod.VULTISIG.WALLET_ADD_CHAIN:
      case RequestMethod.METAMASK.WALLET_ADD_ETHEREUM_CHAIN: {
        if (!Array.isArray(params)) {
          reject()
          break
        }
        const [param] = params
        if (!param?.chainId) {
          reject()
          break
        }

        const chain =
          getCosmosChainByChainId(param.chainId) ||
          getEvmChainByChainId(param.chainId)

        if (!chain) {
          reject()
          return
        }

        storage.getCurrentVaultId().then(async vaultId => {
          const safeVaultId = shouldBePresent(vaultId)
          const host = getDappHostname(sender)
          const allSessions = await getVaultsAppSessions()
          const previousSession = allSessions?.[safeVaultId]?.[host]

          if (previousSession) {
            try {
              await updateAppSession({
                vaultId: safeVaultId,
                host: host,
                fields: {
                  selectedCosmosChainId:
                    getChainKind(chain) === 'cosmos'
                      ? param.chainId
                      : previousSession.selectedCosmosChainId,
                  selectedEVMChainId:
                    getChainKind(chain) === 'evm'
                      ? param.chainId
                      : previousSession.selectedEVMChainId,
                },
              })
            } catch (e) {
              reject(e)
            }
          } else {
            await setCurrentEVMChainId(param.chainId)
          }
          resolve(param.chainId)
        })

        break
      }
      case RequestMethod.METAMASK.WALLET_GET_PERMISSIONS: {
        resolve([])

        break
      }
      case RequestMethod.METAMASK.WALLET_REQUEST_PERMISSIONS: {
        resolve([])

        break
      }
      case RequestMethod.METAMASK.WALLET_REVOKE_PERMISSIONS: {
        const host = getDappHostname(sender)
        getVaultsAppSessions()
          .then(async sessions => {
            const updatedSessions: VaultsAppSessions = {}

            for (const [vaultId, vaultSessions] of Object.entries(
              sessions ?? {}
            )) {
              if (vaultSessions[host]) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { [host]: _, ...rest } = vaultSessions
                updatedSessions[vaultId] = rest
              } else {
                updatedSessions[vaultId] = vaultSessions
              }
            }
            await setVaultsAppSessions(updatedSessions)
            resolve([])
          })
          .catch(reject)

        break
      }
      case RequestMethod.METAMASK.ETH_ESTIMATE_GAS: {
        if (Array.isArray(params)) {
          const [transaction] = params as TransactionRequest[]

          if (transaction) {
            getEvmRpcProvider(chain as EvmChain)
              .estimateGas(transaction)
              .then(gas => resolve(gas.toString()))
              .catch(reject)
          } else {
            reject()
          }
        } else {
          reject()
        }

        break
      }
      case RequestMethod.VULTISIG.WALLET_SWITCH_CHAIN:
      case RequestMethod.METAMASK.WALLET_SWITCH_ETHEREUM_CHAIN: {
        if (!Array.isArray(params)) {
          reject()
          break
        }
        const [param] = params
        if (!param?.chainId) {
          reject()
          break
        }

        const chain = shouldBePresent(
          getCosmosChainByChainId(param.chainId) ||
            getEvmChainByChainId(param.chainId)
        )
        storage.getCurrentVaultId().then(async vaultId => {
          const safeVaultId = shouldBePresent(vaultId)
          const host = getDappHostname(sender)
          const allSessions = await getVaultsAppSessions()
          const previousSession = allSessions?.[safeVaultId]?.[host]

          if (previousSession) {
            await updateAppSession({
              vaultId: safeVaultId,
              host,
              fields: {
                selectedCosmosChainId:
                  getChainKind(chain) === 'cosmos'
                    ? getCosmosChainId(chain as CosmosChain)
                    : previousSession.selectedCosmosChainId,
                selectedEVMChainId:
                  getChainKind(chain) === 'evm'
                    ? getEvmChainId(chain as EvmChain)
                    : previousSession.selectedEVMChainId,
              },
            })
          } else {
            if (getChainKind(chain) === 'evm') {
              await setCurrentEVMChainId(param.chainId)
            } else if (getChainKind(chain) === 'cosmos') {
              await setCurrentCosmosChainId(param.chainId)
            }
          }
          resolve(param.chainId)
        })

        break
      }
      case RequestMethod.METAMASK.ETH_GET_BALANCE: {
        if (Array.isArray(params)) {
          const [address, tag] = params

          if (address && tag) {
            getEvmRpcProvider(chain as EvmChain)
              .getBalance(String(address), String(tag))
              .then(value => resolve(value.toString()))
              .catch(reject)
          } else {
            reject()
          }
        } else {
          reject()
        }

        break
      }
      case RequestMethod.METAMASK.ETH_GET_BLOCK_BY_NUMBER: {
        const [tag, refresh] = params
        getEvmRpcProvider(chain as EvmChain)
          .getBlock(String(tag), Boolean(refresh))
          .then(block => resolve(block?.toJSON()))
          .catch(reject)

        break
      }
      case RequestMethod.METAMASK.ETH_GAS_PRICE: {
        getEvmRpcProvider(chain as EvmChain)
          .getFeeData()
          .then(({ gasPrice, maxFeePerGas }) =>
            resolve((gasPrice ?? maxFeePerGas ?? 0n).toString())
          )
          .catch(reject)

        break
      }
      case RequestMethod.METAMASK.ETH_MAX_PRIORITY_FEE_PER_GAS: {
        getEvmRpcProvider(chain as EvmChain)
          .getFeeData()
          .then(({ maxPriorityFeePerGas }) =>
            resolve((maxPriorityFeePerGas ?? 0n).toString())
          )
          .catch(reject)

        break
      }
      case RequestMethod.METAMASK.ETH_CALL: {
        if (Array.isArray(params)) {
          const [transaction] = params as TransactionRequest[]

          if (transaction) {
            getEvmRpcProvider(chain as EvmChain)
              .call(transaction)
              .then(resolve)
              .catch(reject)
          } else {
            reject(new Error('Invalid transaction'))
          }
        } else {
          reject(new Error('Invalid params'))
        }

        break
      }

      case RequestMethod.METAMASK.ETH_GET_TRANSACTION_RECEIPT: {
        if (Array.isArray(params)) {
          const [transaction] = params as ITransaction[]

          getEvmRpcProvider(chain as EvmChain)
            .getTransactionReceipt(String(transaction))
            .then(receipt => resolve(receipt?.toJSON()))
            .catch(reject)
        } else {
          reject()
        }

        break
      }
      case RequestMethod.METAMASK.ETH_GET_CODE: {
        if (Array.isArray(params)) {
          const [address, tag] = params

          if (address && tag) {
            getEvmRpcProvider(chain as EvmChain)
              .getCode(String(address), String(tag))
              .then(value => resolve(value.toString()))
              .catch(reject)
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
                let sig = Signature.from(ensureHexPrefix(result.txHash))
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
              },
            },
            status: 'default',
          })
            .then(result => {
              let sig = Signature.from(ensureHexPrefix(result.txHash))
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
      case RequestMethod.METAMASK.NET_VERSION: {
        let chainId: string | undefined = undefined

        if (getChainKind(chain) === 'evm') {
          chainId = getEvmChainId(chain as EvmChain)
        } else if (getChainKind(chain) === 'cosmos') {
          chainId = getCosmosChainId(chain as CosmosChain)
        }

        if (chainId) resolve(parseInt(chainId, 16).toString())
        else reject()

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
      default: {
        reject(`Unsupported method: ${method}`)

        break
      }
    }
  })
}
