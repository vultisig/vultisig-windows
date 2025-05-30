import { Chain, EvmChain } from '@core/chain/Chain'
import { getChainKind } from '@core/chain/ChainKind'
import { getCosmosClient } from '@core/chain/chains/cosmos/client'
import { evmChainRpcUrls } from '@core/chain/chains/evm/chainInfo'
import { getEvmClient } from '@core/chain/chains/evm/client'
import {
  CosmosChainId,
  EVMChainId,
  getChainByChainId,
  getChainId,
} from '@core/chain/coin/ChainId'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { ensureHexPrefix } from '@lib/utils/hex/ensureHexPrefix'
import { memoize } from '@lib/utils/memoize'
import {
  getBytes,
  isHexString,
  JsonRpcProvider,
  TransactionRequest,
  TypedDataEncoder,
} from 'ethers'

import { initializeMessenger } from '../../messengers/initializeMessenger'
import {
  getVaultsAppSessions,
  setVaultsAppSessions,
  updateAppSession,
  VaultsAppSessions,
} from '../../sessions/state/appSessions'
import { storage } from '../../storage'
import {
  ThorchainProviderMethod,
  ThorchainProviderResponse,
} from '../../types/thorchain'
import api from '../../utils/api'
import { getDappHost, getDappHostname } from '../../utils/connectedApps'
import { EventMethod, RequestMethod } from '../../utils/constants'
import {
  ITransaction,
  Messaging,
  TransactionDetails,
  TransactionType,
} from '../../utils/interfaces'
import {
  getStandardTransactionDetails,
  isBasicTransaction,
} from '../../utils/tx/getStandardTx'
import { handleFindAccounts, handleGetAccounts } from './accountsHandler'
import { handleSendTransaction } from './transactionsHandler'
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
                if (!account) {
                  return []
                }
                resolve([account])

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
            if (account && getChainKind(chain) === 'evm') {
              inpageMessenger.send(
                `${EventMethod.ACCOUNTS_CHANGED}:${getDappHost(sender)}`,
                account
              )
              try {
                inpageMessenger.send(
                  `${EventMethod.CONNECT}:${getDappHost(sender)}`,
                  {
                    address: account,
                    chainId: getChainId(chain),
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

            const result = specialChains.includes(chain) ? account : [account]
            resolve(result)
          })
          .catch(reject)

        break
      }
      case RequestMethod.VULTISIG.CHAIN_ID:
      case RequestMethod.METAMASK.ETH_CHAIN_ID: {
        resolve(getChainId(chain))

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
                      .then(result => resolve(JSON.stringify(result)))
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
                  .then(result => {
                    resolve(JSON.stringify(result))
                  })
                  .catch(reject)

                break
              }
              default: {
                api.utxo
                  .blockchairGetTx(chain, String(hash))
                  .then(res => resolve(JSON.stringify(res)))
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
        const chain = getChainByChainId(param.chainId)
        if (!chain) {
          reject()
          return
        }

        storage.getCurrentVaultId().then(async vaultId => {
          const safeVaultId = shouldBePresent(vaultId)
          const host = getDappHostname(sender)
          const allSessions = await getVaultsAppSessions()
          const previousSession = allSessions?.[safeVaultId]?.[host]
          if (!previousSession) throw new Error(`No session found for ${host}`)
          const isEVM = getChainKind(chain) === 'evm'
          const isCosmos = getChainKind(chain) === 'cosmos'
          try {
            await updateAppSession({
              vaultId: safeVaultId,
              host: host,
              fields: {
                selectedEVMChainId: isEVM
                  ? (param.chainId as EVMChainId)
                  : previousSession.selectedEVMChainId,
                selectedCosmosChainId: isCosmos
                  ? (param.chainId as CosmosChainId)
                  : previousSession.selectedCosmosChainId,
                chainIds: Array.from(
                  new Set([...(previousSession.chainIds ?? []), param.chainId])
                ),
              },
            })
            resolve(param.chainId)
          } catch (e) {
            reject(e)
          }
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

        const chain = shouldBePresent(getChainByChainId(param.chainId))

        storage.getCurrentVaultId().then(async vaultId => {
          const safeVaultId = shouldBePresent(vaultId)
          const host = getDappHostname(sender)

          const allSessions = await getVaultsAppSessions()
          const previousSession = allSessions?.[safeVaultId]?.[host]

          if (!previousSession) throw new Error(`No session found for ${host}`)

          const isEVM = getChainKind(chain) === 'evm'
          const isCosmos = getChainKind(chain) === 'cosmos'
          const chainId = getChainId(chain)

          await updateAppSession({
            vaultId: safeVaultId,
            host,
            fields: {
              selectedEVMChainId: isEVM
                ? (chainId as EVMChainId)
                : previousSession.selectedEVMChainId,
              selectedCosmosChainId: isCosmos
                ? (chainId as CosmosChainId)
                : previousSession.selectedCosmosChainId,
            },
          })
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
            const [address, msgParamsString] = params
            const msgParams = JSON.parse(String(msgParamsString))
            const { domain, types, message } = msgParams
            // "EIP712Domain" is removed (ethers handles it separately)
            if (types['EIP712Domain']) {
              delete types['EIP712Domain']
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
              .then(result => resolve(ensureHexPrefix(result.txHash)))
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
            .then(result => resolve(ensureHexPrefix(result.txHash)))
            .catch(reject)
        } else {
          reject()
        }

        break
      }
      case RequestMethod.METAMASK.NET_VERSION: {
        resolve(String(parseInt(getChainId(chain), 16)))
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
