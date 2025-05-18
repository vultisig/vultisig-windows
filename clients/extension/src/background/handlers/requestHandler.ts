import { Chain } from '@core/chain/Chain'
import { getChainKind } from '@core/chain/ChainKind'
import { getCosmosClient } from '@core/chain/chains/cosmos/client'
import { getEvmClient } from '@core/chain/chains/evm/client'
import {
  CosmosChainId,
  EVMChainId,
  getChainByChainId,
  getChainId,
} from '@core/chain/coin/ChainId'
import { chainRpcUrl } from '@core/chain/utils/getChainRpcUrl'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import {
  JsonRpcProvider,
  toUtf8String,
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
import {
  ThorchainProviderMethod,
  ThorchainProviderResponse,
} from '../../types/thorchain'
import api from '../../utils/api'
import { getDappHost, getDappHostname } from '../../utils/connectedApps'
import {
  EventMethod,
  isSupportedChain,
  RequestMethod,
} from '../../utils/constants'
import {
  ITransaction,
  Messaging,
  SendTransactionResponse,
  TransactionDetails,
  TransactionType,
} from '../../utils/interfaces'
import {
  getStandardTransactionDetails,
  isBasicTransaction,
} from '../../utils/tx/getStandardTx'
import { getCurrentVaultId } from '../../vault/state/currentVaultId'
import { handleFindAccounts, handleGetAccounts } from './accountsHandler'
import { handleSendTransaction } from './transactionsHandler'

const rpcProviderCache: Record<Chain, JsonRpcProvider | undefined> =
  {} as Record<Chain, JsonRpcProvider | undefined>

const getRpcProvider = (chain: Chain) => {
  if (!rpcProviderCache[chain]) {
    const rpcUrl = chainRpcUrl[chain]
    if (!rpcUrl) {
      throw new Error(`No RPC URL configured for chain ${chain}`)
    }
    rpcProviderCache[chain] = new JsonRpcProvider(rpcUrl)
  }
  return rpcProviderCache[chain]!
}
const inpageMessenger = initializeMessenger({ connect: 'inpage' })
export const handleRequest = (
  body: Messaging.Chain.Request,
  chain: Chain,
  sender: string
): Promise<
  | Messaging.Chain.Response
  | ThorchainProviderResponse<ThorchainProviderMethod>
  | SendTransactionResponse
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
          handleSendTransaction(_transaction as ITransaction, chain)
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
              transactionDetails: standardTx as TransactionDetails,
              chain,
              id: '',
              status: 'default',
            }
            handleSendTransaction(modifiedTransaction, chain)
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
                transactionDetails: standardTx!,
                chain,
                id: '',
                status: 'default',
              }
              handleSendTransaction(modifiedTransaction, chain)
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
              let modifiedTransaction: ITransaction = {} as ITransaction
              modifiedTransaction = {
                transactionDetails: standardTx as TransactionDetails,
                isDeposit: true,
                chain,
                id: '',
                status: 'default',
              }
              handleSendTransaction(modifiedTransaction, chain)
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
        getRpcProvider(chain)
          .getTransactionCount(String(address), String(tag))
          .then(count => resolve(String(count)))
          .catch(reject)
        break
      }
      case RequestMethod.METAMASK.ETH_BLOCK_NUMBER: {
        getRpcProvider(chain)
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
        const supportedChain = isSupportedChain(chain) ? chain : null
        if (!supportedChain) {
          reject()
          return
        }
        getCurrentVaultId().then(async vaultId => {
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
            getRpcProvider(chain)
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

        const chain = getChainByChainId(param.chainId)
        const supportedChain = isSupportedChain(chain) ? chain : null
        if (!supportedChain) {
          reject(`Chain ${param?.chainId} not supported`)
          break
        }

        getCurrentVaultId().then(async vaultId => {
          const safeVaultId = shouldBePresent(vaultId)
          const host = getDappHostname(sender)

          const allSessions = await getVaultsAppSessions()
          const previousSession = allSessions?.[safeVaultId]?.[host]

          if (!previousSession) throw new Error(`No session found for ${host}`)

          const isEVM = getChainKind(supportedChain) === 'evm'
          const isCosmos = getChainKind(supportedChain) === 'cosmos'
          const chainId = getChainId(supportedChain)

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
            getRpcProvider(chain)
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
        getRpcProvider(chain)
          .getBlock(String(tag), Boolean(refresh))
          .then(block => resolve(block?.toJSON()))
          .catch(reject)

        break
      }
      case RequestMethod.METAMASK.ETH_GAS_PRICE: {
        getRpcProvider(chain)
          .getFeeData()
          .then(({ gasPrice, maxFeePerGas }) =>
            resolve((gasPrice ?? maxFeePerGas ?? 0n).toString())
          )
          .catch(reject)

        break
      }
      case RequestMethod.METAMASK.ETH_MAX_PRIORITY_FEE_PER_GAS: {
        getRpcProvider(chain)
          .getFeeData()
          .then(({ maxPriorityFeePerGas }) =>
            resolve((maxPriorityFeePerGas ?? 0n).toString())
          )
          .catch(reject)

        break
      }
      case RequestMethod.METAMASK.ETH_CALL: {
        if (Array.isArray(params)) {
          const [transaction] = params as ITransaction[]

          if (transaction) {
            getRpcProvider(chain).call(transaction).then(resolve).catch(reject)
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

          getRpcProvider(chain)
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
            getRpcProvider(chain)
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
            handleSendTransaction(
              {
                customMessage: {
                  method,
                  address: String(address),
                  message: hashMessage,
                },
                isCustomMessage: true,
                chain: chain,
                transactionDetails: {
                  amount: { amount: '0', decimals: 0 },
                  from: String(address),
                  to: '',
                  asset: {
                    chain: Chain.Ethereum,
                    ticker: 'ETH',
                  },
                },
                id: '',
                status: 'default',
                isDeposit: false,
              },
              chain
            )
              .then(result => resolve(result))
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
          const utf8Message = toUtf8String(String(message))
          handleSendTransaction(
            {
              customMessage: {
                method,
                address: String(address),
                message: `\x19Ethereum Signed Message:\n${utf8Message.length}${utf8Message}`,
              },
              isCustomMessage: true,
              chain: chain,
              transactionDetails: {
                amount: { amount: '0', decimals: 0 },
                from: String(address),
                to: '',
                asset: {
                  chain: Chain.Ethereum,
                  ticker: 'ETH',
                },
              },
              id: '',
              status: 'default',
              isDeposit: false,
            },
            chain
          )
            .then(result => resolve(result))
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
                transactionDetails: standardTx,
                isDeposit: true,
                chain: chain,
                id: '',
                status: 'default',
              }
              handleSendTransaction(tx, chain)
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
                transactionDetails: standardTx,
                chain: chain,
                id: '',
                status: 'default',
              }
              handleSendTransaction(tx, chain)
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
