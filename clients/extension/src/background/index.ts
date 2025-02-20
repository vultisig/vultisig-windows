import {
  ThorchainProviderMethod,
  ThorchainProviderResponse,
} from '@clients/extension/src/types/thorchain'
import api from '@clients/extension/src/utils/api'
import {
  ChainTicker,
  Instance,
  isSupportedChain,
  MessageKey,
  RequestMethod,
  rpcUrl,
} from '@clients/extension/src/utils/constants'
import { calculateWindowPosition } from '@clients/extension/src/utils/functions'
import {
  ChainProps,
  CTRL_TRANSACTION,
  ITransaction,
  Messaging,
  METAMASK_TRANSACTION,
  SendTransactionResponse,
  TransactionDetails,
  VaultProps,
} from '@clients/extension/src/utils/interfaces'
import {
  getIsPriority,
  getStoredChains,
  getStoredTransactions,
  getStoredVaults,
  setIsPriority,
  setStoredChains,
  setStoredRequest,
  setStoredTransactions,
  setStoredVaults,
} from '@clients/extension/src/utils/storage'
import { Chain } from '@core/chain/Chain'
import { getChainKind } from '@core/chain/ChainKind'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { getChainByChainId, getChainId } from '@core/chain/coin/chainId'
import { Tendermint34Client } from '@cosmjs/tendermint-rpc'
import {
  JsonRpcProvider,
  toUtf8String,
  TransactionRequest,
  TypedDataEncoder,
} from 'ethers'
import { v4 as uuidv4 } from 'uuid'

let rpcProvider: JsonRpcProvider

const instance = {
  [Instance.ACCOUNTS]: false,
  [Instance.TRANSACTION]: false,
  [Instance.VAULT]: false,
  [Instance.VAULTS]: false,
}

const handleOpenPanel = (name: string): Promise<number> => {
  return new Promise(resolve => {
    chrome.windows.getCurrent({ populate: true }, currentWindow => {
      const { height, left, top, width } =
        calculateWindowPosition(currentWindow)

      chrome.windows.create(
        {
          url: chrome.runtime.getURL(`${name}.html`),
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
  const rpc = rpcUrl[chain]

  if (update) {
    if (rpcProvider) rpcProvider = new JsonRpcProvider(rpc)
  } else {
    rpcProvider = new JsonRpcProvider(rpc)
  }
}

const handleFindAccounts = (
  chain: Chain,
  sender: string
): Promise<string[]> => {
  return new Promise(resolve => {
    getStoredVaults()
      .then(vaults => {
        resolve(
          vaults.flatMap(({ active, apps, chains }) =>
            active && apps
              ? chains
                  .filter(
                    (selectedChain: ChainProps) =>
                      selectedChain.chain === chain && apps.indexOf(sender) >= 0
                  )
                  .map(({ address }) => address ?? '')
              : []
          )
        )
      })
      .catch(() => resolve([]))
  })
}

const handleFindVault = (
  sender: string
): Promise<Messaging.GetVault.Response> => {
  return new Promise(resolve => {
    getStoredVaults()
      .then(vaults => {
        resolve(
          vaults.find(
            ({ active, apps = [] }) => active && apps.indexOf(sender) >= 0
          )
        )
      })
      .catch(() => resolve(undefined))
  })
}

const handleGetAccounts = (chain: Chain, sender: string): Promise<string[]> => {
  return new Promise(resolve => {
    if (instance[Instance.ACCOUNTS]) {
      const interval = setInterval(() => {
        if (!instance[Instance.ACCOUNTS]) {
          clearInterval(interval)

          handleFindAccounts(chain, sender).then(resolve)
        }
      }, 250)
    } else {
      instance[Instance.ACCOUNTS] = true

      handleFindAccounts(chain, sender).then(accounts => {
        if (accounts.length) {
          instance[Instance.ACCOUNTS] = false

          resolve(accounts)
        } else {
          setStoredRequest({
            chain,
            sender,
          }).then(() => {
            handleOpenPanel(Instance.ACCOUNTS).then(createdWindowId => {
              chrome.windows.onRemoved.addListener(closedWindowId => {
                if (closedWindowId === createdWindowId) {
                  instance[Instance.ACCOUNTS] = false

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
    if (instance[Instance.VAULT]) {
      const interval = setInterval(() => {
        if (!instance[Instance.VAULT]) {
          clearInterval(interval)

          handleFindVault(sender).then(resolve)
        }
      }, 250)
    } else {
      instance[Instance.VAULT] = true

      handleFindVault(sender).then(vault => {
        if (vault) {
          instance[Instance.VAULT] = false

          resolve(vault)
        } else {
          setStoredRequest({
            chain: Chain.Ethereum,
            sender,
          }).then(() => {
            handleOpenPanel(Instance.VAULT).then(createdWindowId => {
              chrome.windows.onRemoved.addListener(closedWindowId => {
                if (closedWindowId === createdWindowId) {
                  instance[Instance.VAULT] = false

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

const handleGetVaults = (): Promise<Messaging.GetVaults.Response> => {
  return new Promise(resolve => {
    getStoredVaults().then(vaults => {
      setStoredVaults(
        vaults.map(vault => ({ ...vault, selected: false }))
      ).then(() => {
        handleOpenPanel('vaults').then(createdWindowId => {
          chrome.windows.onRemoved.addListener(closedWindowId => {
            if (closedWindowId === createdWindowId) {
              getStoredVaults().then(vaults => {
                resolve(
                  vaults
                    .filter(({ selected }) => selected)
                    .map(
                      ({
                        hexChainCode,
                        name,
                        publicKeyEcdsa,
                        publicKeyEddsa,
                        uid,
                      }) => ({
                        chains: [],
                        hexChainCode,
                        name,
                        publicKeyEcdsa,
                        publicKeyEddsa,
                        transactions: [],
                        uid,
                      })
                    )
                )
              })
            }
          })
        })
      })
    })
  })
}

const handleSendTransaction = (
  transaction: ITransaction,
  chain: ChainProps,
  isDeposit?: boolean
): Promise<SendTransactionResponse> => {
  return new Promise((resolve, reject) => {
    getStoredTransactions().then(transactions => {
      const uuid = uuidv4()

      setStoredTransactions([
        {
          ...transaction,
          isDeposit,
          chain,
          id: uuid,
          status: 'default',
        },
        ...transactions,
      ]).then(() => {
        handleOpenPanel('transaction').then(createdWindowId => {
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
                    getStoredVaults().then(vaults => {
                      setStoredVaults(
                        vaults.map(vault => ({
                          ...vault,
                          transactions: [transaction, ...vault.transactions],
                        }))
                      ).then(() => {
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
                      })
                    })
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
  chain: ChainProps,
  sender: string
): Promise<
  | Messaging.Chain.Response
  | ThorchainProviderResponse<ThorchainProviderMethod>
  | SendTransactionResponse
> => {
  return new Promise((resolve, reject) => {
    const { method, params } = body
    if (getChainKind(chain.chain) === 'evm') {
      if (!rpcProvider) handleProvider(chain.chain)
    }

    switch (method) {
      case RequestMethod.VULTISIG.GET_ACCOUNTS:
      case RequestMethod.METAMASK.ETH_ACCOUNTS: {
        handleFindAccounts(chain.chain, sender)
          .then(([account]) => {
            switch (chain.chain) {
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
        handleGetAccounts(chain.chain, sender)
          .then(([account]) => {
            switch (chain.chain) {
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
        handleProvider(chain.chain, true)

        resolve(getChainId(chain.chain))

        break
      }
      case RequestMethod.VULTISIG.SEND_TRANSACTION: {
        const [_transaction] = params
        if (_transaction) {
          let modifiedTransaction: ITransaction = {} as ITransaction
          if (_transaction.value) {
            modifiedTransaction = {
              transactionDetails: {
                from: _transaction.from,
                to: _transaction.to,
                asset: {
                  chain: chain.ticker,
                  symbol: chain.ticker,
                  ticker: chain.ticker,
                },
                amount: _transaction.value
                  ? { amount: _transaction.value, decimals: chain.decimals }
                  : undefined,
                data: _transaction.data,
              },
              chain,
              id: '',
              status: 'default',
            }
          } else {
            modifiedTransaction = {
              transactionDetails: _transaction as TransactionDetails,
              chain,
              id: '',
              status: 'default',
            }
          }

          handleSendTransaction(modifiedTransaction, chain)
            .then(result => resolve(result))
            .catch(reject)
        } else {
          reject()
        }
        break
      }
      case RequestMethod.METAMASK.ETH_SEND_TRANSACTION: {
        if (Array.isArray(params)) {
          const [_transaction] = params as METAMASK_TRANSACTION[]
          if (_transaction) {
            const modifiedTransaction: ITransaction = {
              transactionDetails: {
                from: _transaction.from,
                to: _transaction.to,
                asset: {
                  chain: chain.ticker,
                  symbol: chain.ticker,
                  ticker: chain.ticker,
                },
                amount: _transaction.value
                  ? { amount: _transaction.value, decimals: chain.decimals }
                  : undefined,
                data: _transaction.data,
              },
              chain,
              id: '',
              status: 'default',
            }
            handleSendTransaction(modifiedTransaction, chain)
              .then(result => resolve(result))
              .catch(reject)
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
          const [transaction] = params as ITransaction[]

          if (transaction) {
            handleSendTransaction(transaction, chain, true)
              .then(result => resolve(result))
              .catch(reject)
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
            switch (chain.chain) {
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
                Tendermint34Client.connect(rpcUrl[chain.chain])
                  .then(client => {
                    client
                      .tx({ hash: Buffer.from(String(hash)) })
                      .then(({ result }) => resolve(JSON.stringify(result)))
                      .catch(reject)
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
                api.ethereum
                  .getTransactionByHash(rpcUrl[chain.chain], String(hash))
                  .then(resolve)
                  .catch(reject)

                break
              }
              default: {
                api.utxo
                  .blockchairGetTx(chain.chain, String(hash))
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
        if (Array.isArray(params)) {
          const [param] = params

          if (param?.chainId) {
            const supportedChain = isSupportedChain(
              getChainByChainId(param.chainId)
            )
              ? getChainByChainId(param.chainId)
              : null
            if (supportedChain) {
              getStoredChains().then(storedChains => {
                setStoredChains([
                  { ...chainFeeCoin[supportedChain], active: true },
                  ...storedChains
                    .filter(
                      (storedChain: ChainProps) =>
                        storedChain.chain !== supportedChain
                    )
                    .map(chain => ({ ...chain, active: false })),
                ])
                  .then(() => resolve(param.chainId))
                  .catch(reject)
              })
            } else {
              reject()
            }
          } else {
            reject()
          }
        } else {
          reject()
        }

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
        getStoredVaults().then(vaults => {
          setStoredVaults(
            vaults.map(vault => ({
              ...vault,
              apps: vault.apps?.filter(app => app !== sender),
            }))
          ).then(() => resolve(''))
        })

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
        if (Array.isArray(params)) {
          const [param] = params

          if (param?.chainId) {
            const supportedChain = isSupportedChain(
              getChainByChainId(param.chainId)
            )
              ? getChainByChainId(param.chainId)
              : null
            if (supportedChain) {
              getStoredChains().then(storedChains => {
                const existed =
                  storedChains.findIndex(
                    ({ chain }) => chain === supportedChain
                  ) >= 0

                if (existed) {
                  setStoredChains(
                    storedChains.map(chain => ({
                      ...chain,
                      active: chain.chain === supportedChain,
                    }))
                  )
                    .then(() => resolve(param.chainId))
                    .catch(reject)
                } else {
                  handleRequest(
                    { method: RequestMethod.VULTISIG.WALLET_ADD_CHAIN, params },
                    chain,
                    sender
                  )
                    .then(resolve)
                    .catch(reject)
                }
              })
            } else {
              reject('Chain not Supported')
            }
          } else {
            reject()
          }
        } else {
          reject()
        }

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
                    chain: ChainTicker.ETH,
                    symbol: ChainTicker.ETH,
                    ticker: ChainTicker.ETH,
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
                  chain: ChainTicker.ETH,
                  symbol: ChainTicker.ETH,
                  ticker: ChainTicker.ETH,
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
        resolve(String(parseInt(getChainId(chain.chain), 16)))
        break
      }
      case RequestMethod.CTRL.DEPOSIT: {
        if (Array.isArray(params)) {
          const [_transaction] = params as CTRL_TRANSACTION[]

          if (_transaction) {
            const modifiedTransaction: TransactionDetails = {
              asset: _transaction.asset,
              data: _transaction.memo,
              from: _transaction.from,
              gasLimit: _transaction.gasLimit,
              to: _transaction.recipient,
              amount: _transaction.amount,
            }
            const tx: ITransaction = {
              transactionDetails: modifiedTransaction,
              chain: chain,
              id: '',
              status: 'default',
            }
            handleSendTransaction(tx, chain, true)
              .then(result => resolve(result))
              .catch(reject)
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
          const [_transaction] = params as CTRL_TRANSACTION[]

          if (_transaction) {
            const modifiedTransaction: TransactionDetails = {
              asset: _transaction.asset,
              data: _transaction.memo,
              from: _transaction.from,
              gasLimit: _transaction.gasLimit,
              to: _transaction.recipient,
              amount: _transaction.amount,
            }
            const tx: ITransaction = {
              transactionDetails: modifiedTransaction,
              chain: chain,
              id: '',
              status: 'default',
            }
            handleSendTransaction(tx, chain)
              .then(result => resolve(result))
              .catch(reject)
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
        handleRequest(message, chainFeeCoin.Bitcoin, origin)
          .then(sendResponse)
          .catch(error => sendResponse({ error }))

        break
      }
      case MessageKey.BITCOIN_CASH_REQUEST: {
        handleRequest(message, chainFeeCoin['Bitcoin-Cash'], origin)
          .then(sendResponse)
          .catch(error => sendResponse({ error }))

        break
      }
      case MessageKey.COSMOS_REQUEST: {
        getStoredChains().then(storedChains => {
          const chain = storedChains.find(
            (storedChain: ChainProps) =>
              storedChain.active && getChainKind(storedChain.chain) === 'cosmos'
          )

          if (chain) {
            handleRequest(message, chain, origin)
              .then(response => {
                if (
                  message.method === RequestMethod.VULTISIG.REQUEST_ACCOUNTS
                ) {
                  try {
                    getStoredVaults().then((vaults: VaultProps[]) => {
                      const vault = vaults.find((vault: VaultProps) => {
                        return (
                          vault.chains.find(
                            (selectedChain: ChainProps) =>
                              selectedChain.chain === chain.chain
                          )?.address === response
                        )
                      })

                      const storedChain = vault!.chains.find(
                        (selectedChain: ChainProps) =>
                          selectedChain.chain === chain.chain
                      )!
                      const derivationKey = storedChain.derivationKey
                      if (!derivationKey) {
                        throw new Error('Derivation key is missing!')
                      }

                      const keyBytes = Uint8Array.from(
                        Buffer.from(derivationKey, 'hex')
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
          } else {
            handleRequest(
              {
                method: RequestMethod.VULTISIG.WALLET_ADD_CHAIN,
                params: [{ chainId: getChainId(Chain.Cosmos) }],
              },
              chainFeeCoin.Cosmos,
              origin
            )
              .then(() =>
                handleRequest(message, chainFeeCoin.Cosmos, origin)
                  .then(response => {
                    if (
                      message.method === RequestMethod.VULTISIG.REQUEST_ACCOUNTS
                    ) {
                      getStoredVaults().then((vaults: VaultProps[]) => {
                        const vault = vaults.find((vault: VaultProps) => {
                          return (
                            vault.chains.find(
                              (selectedChain: ChainProps) =>
                                selectedChain.chain === Chain.Cosmos
                            )?.address === response
                          )
                        })
                        const storedChain = vault!.chains.find(
                          (storedChain: ChainProps) =>
                            storedChain.chain === Chain.Cosmos
                        )!
                        const derivationKey = storedChain.derivationKey
                        if (!derivationKey) {
                          throw new Error('Derivation key is missing!')
                        }
                        try {
                          const keyBytes = Uint8Array.from(
                            Buffer.from(derivationKey, 'hex')
                          )

                          const account = [
                            {
                              address: response,
                              algo: 'secp256k1',
                              pubkey: Array.from(keyBytes),
                            },
                          ]

                          sendResponse(account)
                        } catch (e) {
                          console.error(e)
                        }
                      })
                    } else {
                      sendResponse(response)
                    }
                  })

                  .catch(error => sendResponse({ error }))
              )
              .catch(error => sendResponse({ error }))
          }
        })

        break
      }
      case MessageKey.DASH_REQUEST: {
        handleRequest(message, chainFeeCoin.Dash, origin)
          .then(sendResponse)
          .catch(error => sendResponse({ error }))

        break
      }
      case MessageKey.DOGECOIN_REQUEST: {
        handleRequest(message, chainFeeCoin.Dogecoin, origin)
          .then(sendResponse)
          .catch(error => sendResponse({ error }))

        break
      }
      case MessageKey.ETHEREUM_REQUEST: {
        getStoredChains().then(storedChains => {
          const chain = storedChains.find(
            (storedChain: ChainProps) =>
              storedChain.active && getChainKind(storedChain.chain) === 'evm'
          )

          if (chain) {
            handleRequest(message, chain, origin)
              .then(sendResponse)
              .catch(error => sendResponse({ error }))
          } else {
            handleRequest(
              {
                method: RequestMethod.METAMASK.WALLET_SWITCH_ETHEREUM_CHAIN,
                params: [{ chainId: getChainId(Chain.Ethereum) }],
              },
              chainFeeCoin.Ethereum,
              origin
            )
              .then(() =>
                handleRequest(message, chainFeeCoin.Ethereum, origin)
                  .then(sendResponse)
                  .catch(error => sendResponse({ error }))
              )
              .catch(error => sendResponse({ error }))
          }
        })

        break
      }
      case MessageKey.LITECOIN_REQUEST: {
        handleRequest(message, chainFeeCoin.Litecoin, origin)
          .then(sendResponse)
          .catch(error => sendResponse({ error }))

        break
      }
      case MessageKey.MAYA_REQUEST: {
        handleRequest(message, chainFeeCoin.MayaChain, origin)
          .then(sendResponse)
          .catch(error => sendResponse({ error }))

        break
      }
      case MessageKey.SOLANA_REQUEST: {
        handleRequest(message, chainFeeCoin.Solana, origin)
          .then(sendResponse)
          .catch(error => sendResponse({ error }))

        break
      }
      case MessageKey.THOR_REQUEST: {
        handleRequest(message, chainFeeCoin.THORChain, origin)
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
