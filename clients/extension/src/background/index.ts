import { getWalletCore } from '@clients/extension/src/background/walletCore'
import { initializeMessenger } from '@clients/extension/src/messengers/initializeMessenger'
import { appPaths } from '@clients/extension/src/navigation'
import {
  getVaultAppSessions,
  getVaultsAppSessions,
  setVaultsAppSessions,
  updateAppSession,
  VaultsAppSessions,
} from '@clients/extension/src/sessions/state/appSessions'
import {
  ThorchainProviderMethod,
  ThorchainProviderResponse,
} from '@clients/extension/src/types/thorchain'
import api from '@clients/extension/src/utils/api'
import { getDappHostname } from '@clients/extension/src/utils/connectedApps'
import {
  Instance,
  isSupportedChain,
  MessageKey,
  RequestMethod,
} from '@clients/extension/src/utils/constants'
import { calculateWindowPosition } from '@clients/extension/src/utils/functions'
import {
  ITransaction,
  Messaging,
  SendTransactionResponse,
  TransactionDetails,
  TransactionType,
  VaultExport,
} from '@clients/extension/src/utils/interfaces'
import { handleSetupInpage } from '@clients/extension/src/utils/setupInpage'
import {
  getIsPriority,
  getStoredTransactions,
  setIsPriority,
  setStoredRequest,
  setStoredTransactions,
} from '@clients/extension/src/utils/storage'
import {
  getStandardTransactionDetails,
  isBasicTransaction,
} from '@clients/extension/src/utils/tx/getStandardTx'
import { getCurrentVaultId } from '@clients/extension/src/vault/state/currentVaultId'
import { getVaults } from '@clients/extension/src/vault/state/vaults'
import { getVaultsCoins } from '@clients/extension/src/vault/state/vaultsCoins'
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
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { chainRpcUrl } from '@core/chain/utils/getChainRpcUrl'
import { toHexPublicKey } from '@core/chain/utils/toHexPublicKey'
import { getVaultPublicKeyExport } from '@core/ui/vault/share/utils/getVaultPublicKeyExport'
import { getVaultId, Vault } from '@core/ui/vault/Vault'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import {
  JsonRpcProvider,
  toUtf8String,
  TransactionRequest,
  TypedDataEncoder,
} from 'ethers'
import { v4 as uuidv4 } from 'uuid'

if (!navigator.userAgent.toLowerCase().includes('firefox')) {
  ;[
    Object,
    Object.prototype,
    Function,
    Function.prototype,
    Array,
    Array.prototype,
    String,
    String.prototype,
    Number,
    Number.prototype,
    Boolean,
    Boolean.prototype,
  ].forEach(Object.freeze)
}
handleSetupInpage()
const popupMessenger = initializeMessenger({ connect: 'popup' })
let rpcProvider: JsonRpcProvider

const instance: Record<Instance, boolean> = {
  [Instance.CONNECT]: false,
  [Instance.TRANSACTION]: false,
  [Instance.VAULTS]: false,
}

const handleOpenPanel = (path: string): Promise<number> => {
  return new Promise(resolve => {
    chrome.windows.getCurrent({ populate: true }, currentWindow => {
      const { height, left, top, width } =
        calculateWindowPosition(currentWindow)

      chrome.windows.create(
        {
          url: chrome.runtime.getURL(`index.html#${path}`),
          type: 'panel',
          height,
          left,
          top,
          width,
        },
        window => {
          resolve(window?.id ?? 0)
        }
      )
    })
  })
}

const handleProvider = (chain: Chain, update?: boolean) => {
  const rpc = chainRpcUrl[chain]
  if (!rpc) return
  if (update && rpcProvider) {
    rpcProvider = new JsonRpcProvider(rpc)
    return
  }
  rpcProvider = new JsonRpcProvider(rpc)
}

const handleFindAccounts = async (
  _chain: Chain,
  _sender: string
): Promise<string[]> => {
  const currentVaultId = await getCurrentVaultId()
  if (!currentVaultId) return []
  const vaultSessions = await getVaultAppSessions(currentVaultId)
  const currentSession = vaultSessions[getDappHostname(_sender)] ?? null
  if (currentSession) {
    const vaultsCoins = await getVaultsCoins()
    return vaultsCoins[currentVaultId]
      .filter(
        accountCoin => isFeeCoin(accountCoin) && accountCoin.chain === _chain
      )
      .map(({ address }) => address ?? '')
  } else {
    return []
  }
}

const handleFindVault = async (
  _sender: string
): Promise<Messaging.GetVault.Response> => {
  const vaults = await getVaults()
  const currentVaultId = await getCurrentVaultId()
  if (!currentVaultId) return undefined
  const vaultSessions = await getVaultAppSessions(currentVaultId)
  const currentSession = vaultSessions[getDappHostname(_sender)] ?? null
  if (currentSession) {
    const selected = vaults.find(vault => getVaultId(vault) === currentVaultId)
    if (!selected) return undefined
    const { uid, hex_chain_code, name, public_key_ecdsa, public_key_eddsa } =
      getVaultPublicKeyExport(selected)
    return {
      name,
      uid,
      hexChainCode: hex_chain_code,
      publicKeyEcdsa: public_key_ecdsa,
      publicKeyEddsa: public_key_eddsa,
    }
  } else {
    return undefined
  }
}

const handleGetAccounts = (chain: Chain, sender: string): Promise<string[]> => {
  return new Promise(resolve => {
    if (instance[Instance.CONNECT]) {
      const interval = setInterval(() => {
        if (!instance[Instance.CONNECT]) {
          clearInterval(interval)

          handleFindAccounts(chain, sender).then(resolve)
        }
      }, 250)
    } else {
      instance[Instance.CONNECT] = true

      handleFindAccounts(chain, sender).then(accounts => {
        if (accounts.length) {
          instance[Instance.CONNECT] = false

          resolve(accounts)
        } else {
          setStoredRequest({
            chain,
            sender,
          }).then(() => {
            handleOpenPanel(appPaths.connectTab).then(createdWindowId => {
              chrome.windows.onRemoved.addListener(closedWindowId => {
                if (closedWindowId === createdWindowId) {
                  instance[Instance.CONNECT] = false

                  handleFindAccounts(chain, sender).then(resolve)
                }
              })
            })
          })
        }
      })
    }
  })
}

const handleGetVault = (
  sender: string
): Promise<Messaging.GetVault.Response> => {
  return new Promise(resolve => {
    if (instance[Instance.CONNECT]) {
      const interval = setInterval(() => {
        if (!instance[Instance.CONNECT]) {
          clearInterval(interval)

          handleFindVault(sender).then(resolve)
        }
      }, 250)
    } else {
      instance[Instance.CONNECT] = true

      handleFindVault(sender).then(vault => {
        if (vault) {
          instance[Instance.CONNECT] = false

          resolve(vault)
        } else {
          setStoredRequest({
            chain: Chain.Ethereum,
            sender,
          }).then(() => {
            handleOpenPanel(appPaths.connectTab).then(createdWindowId => {
              chrome.windows.onRemoved.addListener(closedWindowId => {
                if (closedWindowId === createdWindowId) {
                  instance[Instance.CONNECT] = false

                  handleFindVault(sender).then(resolve)
                }
              })
            })
          })
        }
      })
    }
  })
}

const handleGetVaults = async (): Promise<Messaging.GetVaults.Response> => {
  return new Promise(resolve => {
    handleOpenPanel(appPaths.vaultsTab)
    popupMessenger.reply(
      'vaults:connect',
      async ({ selectedVaults }: { selectedVaults: VaultExport[] }) => {
        resolve(selectedVaults)
        return
      }
    )
  })
}

const handleSendTransaction = (
  transaction: ITransaction,
  chain: Chain
): Promise<SendTransactionResponse> => {
  return new Promise((resolve, reject) => {
    getStoredTransactions().then(transactions => {
      const uuid = uuidv4()

      setStoredTransactions([
        {
          ...transaction,
          chain,
          id: uuid,
          status: 'default',
        },
        ...transactions,
      ]).then(() => {
        handleOpenPanel(appPaths.transactionTab).then(createdWindowId => {
          getStoredTransactions().then(transactions => {
            setStoredTransactions(
              transactions.map(transaction =>
                transaction.id === uuid
                  ? { ...transaction, windowId: createdWindowId }
                  : transaction
              )
            )
          })

          chrome.windows.onRemoved.addListener(closedWindowId => {
            if (closedWindowId === createdWindowId) {
              getStoredTransactions().then(transactions => {
                const transaction = transactions.find(
                  ({ windowId }) => windowId === createdWindowId
                )

                if (transaction) {
                  if (transaction.status === 'default') {
                    getStoredTransactions().then(transactions => {
                      setStoredTransactions(
                        transactions.filter(
                          transaction =>
                            transaction.id !== uuid &&
                            transaction.windowId !== createdWindowId
                        )
                      ).then(reject)
                    })
                  } else {
                    if (transaction.customSignature) {
                      resolve({
                        txResponse: transaction.customSignature,
                        raw: transaction.raw,
                      })
                    } else if (transaction.txHash) {
                      resolve({
                        txResponse: transaction.txHash,
                        raw: transaction.raw,
                      })
                    } else {
                      reject()
                    }
                  }
                } else {
                  reject()
                }
              })
            }
          })
        })
      })
    })
  })
}

const handleRequest = (
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
    if (getChainKind(chain) === 'evm') {
      if (!rpcProvider) handleProvider(chain)
    }

    switch (method) {
      case RequestMethod.VULTISIG.GET_ACCOUNTS:
      case RequestMethod.METAMASK.ETH_ACCOUNTS: {
        handleFindAccounts(chain, sender)
          .then(([account]) => {
            switch (chain) {
              case Chain.Dydx:
              case Chain.Cosmos:
              case Chain.Kujira:
              case Chain.Osmosis: {
                resolve(account)

                break
              }
              default: {
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
                resolve([account])

                break
              }
            }
          })
          .catch(reject)

        break
      }
      case RequestMethod.VULTISIG.CHAIN_ID:
      case RequestMethod.METAMASK.ETH_CHAIN_ID: {
        handleProvider(chain, true)

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
        rpcProvider
          .getTransactionCount(String(address), String(tag))
          .then(count => resolve(String(count)))
        break
      }
      case RequestMethod.METAMASK.ETH_BLOCK_NUMBER: {
        rpcProvider
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
            rpcProvider
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
        })

        break
      }
      case RequestMethod.METAMASK.ETH_GET_BALANCE: {
        if (Array.isArray(params)) {
          const [address, tag] = params

          if (address && tag) {
            rpcProvider
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
        rpcProvider
          .getBlock(String(tag), Boolean(refresh))
          .then(block => resolve(block?.toJSON()))
          .catch(reject)

        break
      }
      case RequestMethod.METAMASK.ETH_GAS_PRICE: {
        rpcProvider
          .getFeeData()
          .then(({ gasPrice }) => resolve(gasPrice!.toString()))
          .catch(reject)

        break
      }
      case RequestMethod.METAMASK.ETH_MAX_PRIORITY_FEE_PER_GAS: {
        rpcProvider
          .getFeeData()
          .then(({ maxFeePerGas }) => resolve(maxFeePerGas!.toString()))

        break
      }
      case RequestMethod.METAMASK.ETH_CALL: {
        if (Array.isArray(params)) {
          const [transaction] = params as ITransaction[]

          if (transaction) {
            rpcProvider.call(transaction).then(resolve).catch(reject)
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

          rpcProvider
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
            rpcProvider
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

const handleSetPriority = (body: Messaging.SetPriority.Request) => {
  return new Promise(resolve => {
    if (body.priority) {
      setIsPriority(body.priority)
      resolve(body.priority)
    } else {
      getIsPriority().then(resolve)
    }
  })
}

chrome.runtime.onMessage.addListener(
  (
    { message, type }: { message: any; type: MessageKey },
    sender,
    sendResponse
  ) => {
    const { origin = '' } = sender

    switch (type) {
      case MessageKey.BITCOIN_REQUEST: {
        handleRequest(message, Chain.Bitcoin, origin)
          .then(sendResponse)
          .catch(error => sendResponse({ error }))

        break
      }
      case MessageKey.BITCOIN_CASH_REQUEST: {
        handleRequest(message, Chain.BitcoinCash, origin)
          .then(sendResponse)
          .catch(error => sendResponse({ error }))

        break
      }
      case MessageKey.COSMOS_REQUEST: {
        getVaultsAppSessions().then(sessions => {
          const dappHostname = getDappHostname(origin)
          const selectedCosmosChainId = Object.values(sessions).reduce(
            (acc: CosmosChainId, vault) => {
              const session = vault[dappHostname]
              if (session && session.selectedCosmosChainId) {
                return session.selectedCosmosChainId
              }
              return acc
            },
            getChainId(Chain.Cosmos) as CosmosChainId
          )
          const chain = getChainByChainId(selectedCosmosChainId)
          if (!chain) {
            return
          }
          handleRequest(message, shouldBePresent(chain), origin)
            .then(response => {
              if (message.method === RequestMethod.VULTISIG.REQUEST_ACCOUNTS) {
                try {
                  getVaults().then(async (vaults: Vault[]) => {
                    const allCoins = await getVaultsCoins()
                    const vault = vaults.find(vault => {
                      const coins = allCoins[getVaultId(vault)] ?? []
                      return coins.some(
                        coin =>
                          isFeeCoin(coin) &&
                          coin.chain === chain &&
                          coin.address === response
                      )
                    })
                    if (!vault) {
                      throw new Error('Vault not found!')
                    }
                    const walletCore = await getWalletCore()
                    if (!walletCore) {
                      throw new Error('WalletCore is not initialized!')
                    }
                    const publicKey = getPublicKey({
                      chain: chain,
                      walletCore,
                      hexChainCode: vault.hexChainCode,
                      publicKeys: vault.publicKeys,
                    })

                    const keyBytes = Uint8Array.from(
                      Buffer.from(
                        toHexPublicKey({
                          publicKey,
                          walletCore,
                        }),
                        'hex'
                      )
                    )

                    const account = [
                      {
                        pubkey: Array.from(keyBytes),
                        address: response,
                        algo: 'secp256k1',
                        bech32Address: response,
                        isKeystone: false,
                        isNanoLedger: false,
                      },
                    ]
                    sendResponse(account)
                  })
                } catch (e) {
                  console.error(e)
                }
              } else {
                sendResponse(response)
              }
            })
            .catch(error => sendResponse({ error }))
        })

        break
      }
      case MessageKey.DASH_REQUEST: {
        handleRequest(message, Chain.Dash, origin)
          .then(sendResponse)
          .catch(error => sendResponse({ error }))

        break
      }
      case MessageKey.DOGECOIN_REQUEST: {
        handleRequest(message, Chain.Dogecoin, origin)
          .then(sendResponse)
          .catch(error => sendResponse({ error }))

        break
      }
      case MessageKey.ETHEREUM_REQUEST: {
        getVaultsAppSessions().then(sessions => {
          const dappHostname = getDappHostname(origin)
          const selectedEVMChainId = Object.values(sessions).reduce(
            (acc: EVMChainId, vault) => {
              const session = vault[dappHostname]
              if (session && session.selectedEVMChainId) {
                return session.selectedEVMChainId
              }
              return acc
            },
            getChainId(Chain.Ethereum) as EVMChainId
          )
          handleRequest(
            message,
            shouldBePresent(getChainByChainId(selectedEVMChainId)),
            origin
          )
            .then(sendResponse)
            .catch(error => sendResponse({ error }))
        })

        break
      }
      case MessageKey.LITECOIN_REQUEST: {
        handleRequest(message, Chain.Litecoin, origin)
          .then(sendResponse)
          .catch(error => sendResponse({ error }))

        break
      }
      case MessageKey.MAYA_REQUEST: {
        handleRequest(message, Chain.MayaChain, origin)
          .then(sendResponse)
          .catch(error => sendResponse({ error }))

        break
      }
      case MessageKey.SOLANA_REQUEST: {
        handleRequest(message, Chain.Solana, origin)
          .then(sendResponse)
          .catch(error => sendResponse({ error }))

        break
      }
      case MessageKey.THOR_REQUEST: {
        handleRequest(message, Chain.THORChain, origin)
          .then(sendResponse)
          .catch(error => sendResponse({ error }))

        break
      }
      case MessageKey.PRIORITY: {
        handleSetPriority(message).then(sendResponse)

        break
      }
      case MessageKey.VAULT: {
        handleGetVault(origin).then(sendResponse)

        break
      }
      case MessageKey.VAULTS: {
        handleGetVaults().then(sendResponse)

        break
      }
      default: {
        break
      }
    }

    return true
  }
)
