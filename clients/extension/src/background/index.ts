import { v4 as uuidv4 } from "uuid";
import { JsonRpcProvider, TransactionRequest, toUtf8String } from "ethers";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";

import {
  ChainKey,
  Instance,
  MessageKey,
  RequestMethod,
  chains,
  cosmosChains,
  evmChains,
  rpcUrl,
} from "../utils/constants";
import { calculateWindowPosition, findChainByProp } from "../utils/functions";
import {
  ChainProps,
  ITransaction,
  Messaging,
  VaultProps,
} from "../utils/interfaces";

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
} from "../utils/storage";
import api from "../utils/api";
import {
  ThorchainProviderMethod,
  ThorchainProviderResponse,
} from "../types/thorchain";

let rpcProvider: JsonRpcProvider;

const instance = {
  [Instance.ACCOUNTS]: false,
  [Instance.TRANSACTION]: false,
  [Instance.VAULTS]: false,
};

const handleOpenPanel = (name: string): Promise<number> => {
  return new Promise((resolve) => {
    chrome.windows.getCurrent({ populate: true }, (currentWindow) => {
      const { height, left, top, width } =
        calculateWindowPosition(currentWindow);

      chrome.windows.create(
        {
          url: chrome.runtime.getURL(`${name}.html`),
          type: "panel",
          height,
          left,
          top,
          width,
        },
        (window) => {
          resolve(window?.id ?? 0);
        },
      );
    });
  });
};

const handleProvider = (chain: ChainKey, update?: boolean) => {
  const rpc = rpcUrl[chain];

  if (update) {
    if (rpcProvider) rpcProvider = new JsonRpcProvider(rpc);
  } else {
    rpcProvider = new JsonRpcProvider(rpc);
  }
};

const handleFindAccounts = (
  chain: ChainKey,
  sender: string,
): Promise<string[]> => {
  return new Promise((resolve) => {
    getStoredVaults()
      .then((vaults) => {
        resolve(
          vaults.flatMap(({ active, apps, chains }) =>
            active && apps
              ? chains
                  .filter(
                    (selectedChain: ChainProps) =>
                      selectedChain.name === chain && apps.indexOf(sender) >= 0,
                  )
                  .map(({ address }) => address ?? "")
              : [],
          ),
        );
      })
      .catch(() => resolve([]));
  });
};

const handleGetAccounts = (
  chain: ChainKey,
  sender: string,
): Promise<string[]> => {
  return new Promise((resolve) => {
    if (instance[Instance.ACCOUNTS]) {
      let interval = setInterval(() => {
        if (!instance[Instance.ACCOUNTS]) {
          clearInterval(interval);

          handleFindAccounts(chain, sender).then(resolve);
        }
      }, 250);
    } else {
      instance[Instance.ACCOUNTS] = true;

      handleFindAccounts(chain, sender).then((accounts) => {
        if (accounts.length) {
          instance[Instance.ACCOUNTS] = false;

          resolve(accounts);
        } else {
          setStoredRequest({
            chain,
            sender,
          }).then(() => {
            handleOpenPanel(Instance.ACCOUNTS).then((createdWindowId) => {
              chrome.windows.onRemoved.addListener((closedWindowId) => {
                if (closedWindowId === createdWindowId) {
                  instance[Instance.ACCOUNTS] = false;

                  handleFindAccounts(chain, sender).then(resolve);
                }
              });
            });
          });
        }
      });
    }
  });
};

const handleGetVaults = (): Promise<Messaging.GetVaults.Response> => {
  return new Promise((resolve) => {
    getStoredVaults().then((vaults) => {
      setStoredVaults(
        vaults.map((vault) => ({ ...vault, selected: false })),
      ).then(() => {
        handleOpenPanel("vaults").then((createdWindowId) => {
          chrome.windows.onRemoved.addListener((closedWindowId) => {
            if (closedWindowId === createdWindowId) {
              getStoredVaults().then((vaults) => {
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
                      }),
                    ),
                );
              });
            }
          });
        });
      });
    });
  });
};

const handleSendTransaction = (
  transaction: ITransaction.METAMASK,
  chain: ChainProps,
  isDeposit?: boolean,
): Promise<{ txResponse: string; raw: any }> => {
  return new Promise((resolve, reject) => {
    getStoredTransactions().then((transactions) => {
      const uuid = uuidv4();

      setStoredTransactions([
        {
          ...transaction,
          isDeposit,
          chain,
          id: uuid,
          status: "default",
        },
        ...transactions,
      ]).then(() => {
        handleOpenPanel("transaction").then((createdWindowId) => {
          getStoredTransactions().then((transactions) => {
            setStoredTransactions(
              transactions.map((transaction) =>
                transaction.id === uuid
                  ? { ...transaction, windowId: createdWindowId }
                  : transaction,
              ),
            );
          });

          chrome.windows.onRemoved.addListener((closedWindowId) => {
            if (closedWindowId === createdWindowId) {
              getStoredTransactions().then((transactions) => {
                const transaction = transactions.find(
                  ({ windowId }) => windowId === createdWindowId,
                );

                if (transaction) {
                  if (transaction.status === "default") {
                    getStoredTransactions().then((transactions) => {
                      setStoredTransactions(
                        transactions.filter(
                          (transaction) =>
                            transaction.id !== uuid &&
                            transaction.windowId !== createdWindowId,
                        ),
                      ).then(reject);
                    });
                  } else {
                    getStoredVaults().then((vaults) => {
                      setStoredVaults(
                        vaults.map((vault) => ({
                          ...vault,
                          transactions: [transaction, ...vault.transactions],
                        })),
                      ).then(() => {
                        if (transaction.customSignature) {
                          resolve({
                            txResponse: transaction.customSignature,
                            raw: transaction.raw,
                          });
                        } else if (transaction.txHash) {
                          resolve({
                            txResponse: transaction.txHash,
                            raw: transaction.raw,
                          });
                        } else {
                          reject();
                        }
                      });
                    });
                  }
                } else {
                  reject();
                }
              });
            }
          });
        });
      });
    });
  });
};

const handleRequest = (
  body: Messaging.Chain.Request,
  chain: ChainProps,
  sender: string,
): Promise<
  Messaging.Chain.Response | ThorchainProviderResponse<ThorchainProviderMethod>
> => {
  return new Promise((resolve, reject) => {
    const { method, params } = body;
    if (evmChains.includes(chain.name)) {
      if (!rpcProvider) handleProvider(chain.name);
    }

    switch (method) {
      case RequestMethod.VULTISIG.GET_ACCOUNTS:
      case RequestMethod.METAMASK.ETH_ACCOUNTS: {
        handleFindAccounts(chain.name, sender)
          .then(([account]) => {
            switch (chain.name) {
              case ChainKey.DYDX:
              case ChainKey.GAIACHAIN:
              case ChainKey.KUJIRA:
              case ChainKey.OSMOSIS: {
                resolve(account);

                break;
              }
              default: {
                resolve([account]);

                break;
              }
            }
          })
          .catch(reject);

        break;
      }
      case RequestMethod.VULTISIG.REQUEST_ACCOUNTS:
      case RequestMethod.METAMASK.ETH_REQUEST_ACCOUNTS: {
        handleGetAccounts(chain.name, sender)
          .then(([account]) => {
            switch (chain.name) {
              case ChainKey.DYDX:
              case ChainKey.GAIACHAIN:
              case ChainKey.KUJIRA:
              case ChainKey.OSMOSIS:
              case ChainKey.SOLANA: {
                resolve(account);

                break;
              }
              default: {
                resolve([account]);

                break;
              }
            }
          })
          .catch(reject);

        break;
      }
      case RequestMethod.VULTISIG.CHAIN_ID:
      case RequestMethod.METAMASK.ETH_CHAIN_ID: {
        handleProvider(chain.name, true);

        resolve(chain.id);

        break;
      }
      case RequestMethod.VULTISIG.SEND_TRANSACTION:
      case RequestMethod.METAMASK.ETH_SEND_TRANSACTION: {
        if (Array.isArray(params)) {
          const [transaction] = params as ITransaction.METAMASK[];

          if (transaction) {
            handleSendTransaction(transaction, chain)
              .then((result) => resolve(result.txResponse))
              .catch(reject);
          } else {
            reject();
          }
        } else {
          reject();
        }

        break;
      }
      case RequestMethod.VULTISIG.DEPOSIT_TRANSACTION: {
        if (Array.isArray(params)) {
          const [transaction] = params as ITransaction.METAMASK[];

          if (transaction) {
            handleSendTransaction(transaction, chain, true)
              .then((result) =>
                chain.name === ChainKey.SOLANA
                  ? resolve([result.txResponse, result.raw])
                  : resolve(result.txResponse),
              )
              .catch(reject);
          } else {
            reject();
          }
        } else {
          reject();
        }

        break;
      }
      case RequestMethod.VULTISIG.GET_TRANSACTION_BY_HASH: 
      case RequestMethod.METAMASK.ETH_GET_TRANSACTION_BY_HASH: {
        if (Array.isArray(params)) {
          const [hash] = params;

          if (hash) {
            switch (chain.name) {
              // Thor
              case ChainKey.THORCHAIN: {
                api.thorchain
                  .getTransactionByHash(String(hash))
                  .then(resolve)
                  .catch(reject);

                break;
              }
              // Cosmos
              case ChainKey.DYDX:
              case ChainKey.GAIACHAIN:
              case ChainKey.KUJIRA:
              case ChainKey.MAYACHAIN:
              case ChainKey.OSMOSIS: {
                Tendermint34Client.connect(rpcUrl[chain.name])
                  .then((client) => {
                    client
                      .tx({ hash: Buffer.from(String(hash)) })
                      .then(({ result }) => resolve(JSON.stringify(result)))
                      .catch(reject);
                  })
                  .catch((error) =>
                    reject(`Could not initialize Tendermint Client: ${error}`),
                  );

                break;
              }
              // EVM
              case ChainKey.AVALANCHE:
              case ChainKey.ARBITRUM:
              case ChainKey.BASE:
              case ChainKey.BSCCHAIN:
              case ChainKey.CRONOSCHAIN:
              case ChainKey.ETHEREUM:
              case ChainKey.OPTIMISM:
              case ChainKey.POLYGON: {
                api.ethereum
                  .getTransactionByHash(rpcUrl[chain.name], String(hash))
                  .then(resolve)
                  .catch(reject);

                break;
              }
              default: {
                api.utxo
                  .blockchairGetTx(chain.name, String(hash))
                  .then((res) => resolve(JSON.stringify(res)))
                  .catch(reject);

                break;
              }
            }
          } else {
            reject();
          }
        } else {
          reject();
        }

        break;
      }
      case RequestMethod.METAMASK.ETH_GET_TRANSACTION_COUNT: {
        const [address, tag] = params;
        rpcProvider
          .getTransactionCount(String(address), String(tag))
          .then((count) => resolve(String(count)));
        break;
      }
      case RequestMethod.METAMASK.ETH_BLOCK_NUMBER: {
        rpcProvider
          .getBlock("latest")
          .then((block) => resolve(String(block?.number)))
          .catch(reject);

        break;
      }
      case RequestMethod.VULTISIG.WALLET_ADD_CHAIN:
      case RequestMethod.METAMASK.WALLET_ADD_ETHEREUM_CHAIN: {
        if (Array.isArray(params)) {
          const [param] = params;

          if (param?.chainId) {
            const supportedChain = findChainByProp(chains, "id", param.chainId);

            if (supportedChain) {
              getStoredChains().then((storedChains) => {
                setStoredChains([
                  { ...supportedChain, active: true },
                  ...storedChains
                    .filter(
                      (storedChain: ChainProps) =>
                        storedChain.name !== supportedChain.name,
                    )
                    .map((chain) => ({ ...chain, active: false })),
                ])
                  .then(() => resolve(supportedChain.id))
                  .catch(reject);
              });
            } else {
              reject();
            }
          } else {
            reject();
          }
        } else {
          reject();
        }

        break;
      }
      case RequestMethod.METAMASK.WALLET_GET_PERMISSIONS: {
        resolve([]);

        break;
      }
      case RequestMethod.METAMASK.WALLET_REQUEST_PERMISSIONS: {
        resolve([]);

        break;
      }
      case RequestMethod.METAMASK.WALLET_REVOKE_PERMISSIONS: {
        getStoredVaults().then((vaults) => {
          setStoredVaults(
            vaults.map((vault) => ({
              ...vault,
              apps: vault.apps?.filter((app) => app !== sender),
            })),
          ).then(() => resolve(""));
        });

        break;
      }
      case RequestMethod.METAMASK.ETH_ESTIMATE_GAS: {
        if (Array.isArray(params)) {
          const [transaction] = params as TransactionRequest[];

          if (transaction) {
            rpcProvider
              .estimateGas(transaction)
              .then((gas) => resolve(gas.toString()))
              .catch(reject);
          } else {
            reject();
          }
        } else {
          reject();
        }

        break;
      }
      case RequestMethod.VULTISIG.WALLET_SWITCH_CHAIN:
      case RequestMethod.METAMASK.WALLET_SWITCH_ETHEREUM_CHAIN: {
        if (Array.isArray(params)) {
          const [param] = params;

          if (param?.chainId) {
            const supportedChain = findChainByProp(chains, "id", param.chainId);

            if (supportedChain) {
              getStoredChains().then((storedChains) => {
                const existed =
                  storedChains.findIndex(({ id }) => id === param.chainId) >= 0;

                if (existed) {
                  setStoredChains(
                    storedChains.map((chain) => ({
                      ...chain,
                      active: chain.id === param.chainId,
                    })),
                  )
                    .then(() => resolve(param.chainId))
                    .catch(reject);
                } else {
                  handleRequest(
                    { method: RequestMethod.VULTISIG.WALLET_ADD_CHAIN, params },
                    chain,
                    sender,
                  )
                    .then(resolve)
                    .catch(reject);
                }
              });
            } else {
              reject("Chain not Supported");
            }
          } else {
            reject();
          }
        } else {
          reject();
        }

        break;
      }
      case RequestMethod.METAMASK.ETH_GET_BALANCE: {
        if (Array.isArray(params)) {
          const [address, tag] = params;

          if (address && tag) {
            rpcProvider
              .getBalance(String(address), String(tag))
              .then((value) => resolve(value.toString()))
              .catch(reject);
          } else {
            reject();
          }
        } else {
          reject();
        }

        break;
      }
      case RequestMethod.METAMASK.ETH_GET_BLOCK_BY_NUMBER: {
        const [tag, refresh] = params;
        rpcProvider
          .getBlock(String(tag), Boolean(refresh))
          .then((block) => resolve(block?.toJSON()))
          .catch(reject);

        break;
      }
      case RequestMethod.METAMASK.ETH_GAS_PRICE: {
        rpcProvider
          .getFeeData()
          .then(({ gasPrice }) => resolve(gasPrice!.toString()))
          .catch(reject);

        break;
      }
      case RequestMethod.METAMASK.ETH_MAX_PRIORITY_FEE_PER_GAS: {
        rpcProvider
          .getFeeData()
          .then(({ maxFeePerGas }) => resolve(maxFeePerGas!.toString()));

        break;
      }
      case RequestMethod.METAMASK.ETH_CALL: {
        if (Array.isArray(params)) {
          const [transaction] = params as ITransaction.METAMASK[];

          transaction ? resolve(rpcProvider.call(transaction)) : reject();
        } else {
          reject();
        }

        break;
      }
      case RequestMethod.METAMASK.ETH_GET_TRANSACTION_RECEIPT: {
        if (Array.isArray(params)) {
          const [transaction] = params as ITransaction.METAMASK[];

          rpcProvider
            .getTransactionReceipt(String(transaction))
            .then((receipt) => resolve(receipt?.toJSON()))
            .catch(reject);
        } else {
          reject();
        }

        break;
      }
      case RequestMethod.METAMASK.ETH_GET_CODE: {
        if (Array.isArray(params)) {
          const [address, tag] = params;

          if (address && tag) {
            rpcProvider
              .getCode(String(address), String(tag))
              .then((value) => resolve(value.toString()))
              .catch(reject);
          } else {
            reject();
          }
        } else {
          reject();
        }

        break;
      }
      case RequestMethod.METAMASK.PERSONAL_SIGN: {
        if (Array.isArray(params)) {
          const [message, address] = params;
          const utf8Message = toUtf8String(String(message));
          handleSendTransaction(
            {
              customMessage: {
                address: String(address),
                message: `\x19Ethereum Signed Message:\n${utf8Message.length}${utf8Message}`,
              },
              isCustomMessage: true,
              chain: chain,
              data: "",
              from: String(address),
              id: "",
              status: "default",
              to: "",
              isDeposit: false,
            },
            chain,
          )
            .then((result) => resolve(result.txResponse))
            .catch(reject);
        } else {
          reject();
        }

        break;
      }
      case RequestMethod.METAMASK.NET_VERSION: {
        resolve(String(parseInt(chain.id, 16)));
        break;
      }
      case RequestMethod.CTRL.DEPOSIT: {
        if (Array.isArray(params)) {
          const [_transaction] = params as ITransaction.CTRL[];

          if (_transaction) {
            const transaction = {
              data: _transaction.memo,
              from: _transaction.from,
              gasLimit: _transaction.gasLimit,
              to: _transaction.recipient,
              value: _transaction.amount.amount.toString(),
            } as ITransaction.METAMASK;

            handleSendTransaction(transaction, chain, true)
              .then((result) => resolve(result.txResponse))
              .catch(reject);
          } else {
            reject();
          }
        } else {
          reject();
        }

        break;
      }
      case RequestMethod.CTRL.TRANSFER: {
        if (Array.isArray(params)) {
          const [_transaction] = params as ITransaction.CTRL[];

          if (_transaction) {
            const transaction = {
              data: _transaction.memo,
              from: _transaction.from,
              gasLimit: _transaction.gasLimit,
              to: _transaction.recipient,
              value: _transaction.amount.amount.toString(),
            } as ITransaction.METAMASK;

            handleSendTransaction(transaction, chain)
              .then((result) => resolve(result.txResponse))
              .catch(reject);
          } else {
            reject();
          }
        } else {
          reject();
        }

        break;
      }
      default: {
        reject(`Unsupported method: ${method}`);

        break;
      }
    }
  });
};

const handleSetPriority = (body: Messaging.SetPriority.Request) => {
  return new Promise(async (resolve) => {
    if (body.priority) {
      setIsPriority(body.priority);
      resolve(body.priority);
    } else {
      resolve(await getIsPriority());
    }
  });
};

chrome.runtime.onMessage.addListener(
  (
    { message, type }: { message: any; type: MessageKey },
    sender,
    sendResponse,
  ) => {
    const { origin = "" } = sender;

    switch (type) {
      case MessageKey.BITCOIN_REQUEST: {
        handleRequest(message, chains[ChainKey.BITCOIN], origin)
          .then(sendResponse)
          .catch((error) => sendResponse({ error }));

        break;
      }
      case MessageKey.BITCOIN_CASH_REQUEST: {
        handleRequest(message, chains[ChainKey.BITCOINCASH], origin)
          .then(sendResponse)
          .catch((error) => sendResponse({ error }));

        break;
      }
      case MessageKey.COSMOS_REQUEST: {
        getStoredChains().then((storedChains) => {
          const chain = storedChains.find(
            (storedChain: ChainProps) =>
              storedChain.active && cosmosChains.includes(storedChain.name),
          );

          if (chain) {
            handleRequest(message, chain, origin)
              .then((response) => {
                if (
                  message.method === RequestMethod.VULTISIG.REQUEST_ACCOUNTS
                ) {
                  try {
                    getStoredVaults().then((vaults: VaultProps[]) => {
                      const vault = vaults.find((vault: VaultProps) => {
                        return (
                          vault.chains.find(
                            (selectedChain: ChainProps) =>
                              selectedChain.name === chain.name,
                          )?.address === response
                        );
                      });

                      const storedChain = vault!.chains.find(
                        (selectedChain: ChainProps) =>
                          selectedChain.name === chain.name,
                      )!;
                      const derivationKey = storedChain.derivationKey;
                      if (!derivationKey) {
                        throw new Error("Derivation key is missing!");
                      }

                      const keyBytes = Uint8Array.from(
                        Buffer.from(derivationKey, "hex"),
                      );

                      const account = [
                        {
                          pubkey: Array.from(keyBytes),
                          address: response,
                          algo: "secp256k1",
                          bech32Address: response,
                          isKeystone: false,
                          isNanoLedger: false,
                        },
                      ];
                      sendResponse(account);
                    });
                  } catch (e) {
                    console.error(e);
                  }
                } else {
                  sendResponse(response);
                }
              })
              .catch((error) => sendResponse({ error }));
          } else {
            handleRequest(
              {
                method: RequestMethod.VULTISIG.WALLET_ADD_CHAIN,
                params: [{ chainId: chains[ChainKey.GAIACHAIN].id }],
              },
              chains[ChainKey.GAIACHAIN],
              origin,
            )
              .then(() =>
                handleRequest(message, chains[ChainKey.GAIACHAIN], origin)
                  .then((response) => {
                    if (
                      message.method === RequestMethod.VULTISIG.REQUEST_ACCOUNTS
                    ) {
                      getStoredVaults().then((vaults: VaultProps[]) => {
                        const vault = vaults.find((vault: VaultProps) => {
                          return (
                            vault.chains.find(
                              (selectedChain: ChainProps) =>
                                selectedChain.name === ChainKey.GAIACHAIN,
                            )?.address === response
                          );
                        });
                        const storedChain = vault!.chains.find(
                          (storedChain: ChainProps) =>
                            storedChain.name === ChainKey.GAIACHAIN,
                        )!;
                        const derivationKey = storedChain.derivationKey;
                        if (!derivationKey) {
                          throw new Error("Derivation key is missing!");
                        }
                        try {
                          const keyBytes = Uint8Array.from(
                            Buffer.from(derivationKey, "hex"),
                          );

                          const account = [
                            {
                              address: response,
                              algo: "secp256k1",
                              pubkey: Array.from(keyBytes),
                            },
                          ];

                          sendResponse(account);
                        } catch (e) {
                          console.error(e);
                        }
                      });
                    } else {
                      sendResponse(response);
                    }
                  })

                  .catch((error) => sendResponse({ error })),
              )
              .catch((error) => sendResponse({ error }));
          }
        });

        break;
      }
      case MessageKey.DASH_REQUEST: {
        handleRequest(message, chains[ChainKey.DASH], origin)
          .then(sendResponse)
          .catch((error) => sendResponse({ error }));

        break;
      }
      case MessageKey.DOGECOIN_REQUEST: {
        handleRequest(message, chains[ChainKey.DOGECOIN], origin)
          .then(sendResponse)
          .catch((error) => sendResponse({ error }));

        break;
      }
      case MessageKey.ETHEREUM_REQUEST: {
        getStoredChains().then((storedChains) => {
          const chain = storedChains.find(
            (storedChain: ChainProps) =>
              storedChain.active && evmChains.indexOf(storedChain.name) >= 0,
          );

          if (chain) {
            handleRequest(message, chain, origin)
              .then(sendResponse)
              .catch((error) => sendResponse({ error }));
          } else {
            handleRequest(
              {
                method: RequestMethod.METAMASK.WALLET_SWITCH_ETHEREUM_CHAIN,
                params: [{ chainId: chains[ChainKey.ETHEREUM].id }],
              },
              chains[ChainKey.ETHEREUM],
              origin,
            )
              .then(() =>
                handleRequest(message, chains[ChainKey.ETHEREUM], origin)
                  .then(sendResponse)
                  .catch((error) => sendResponse({ error })),
              )
              .catch((error) => sendResponse({ error }));
          }
        });

        break;
      }
      case MessageKey.LITECOIN_REQUEST: {
        handleRequest(message, chains[ChainKey.LITECOIN], origin)
          .then(sendResponse)
          .catch((error) => sendResponse({ error }));

        break;
      }
      case MessageKey.MAYA_REQUEST: {
        handleRequest(message, chains[ChainKey.MAYACHAIN], origin)
          .then(sendResponse)
          .catch((error) => sendResponse({ error }));

        break;
      }
      case MessageKey.SOLANA_REQUEST: {
        handleRequest(message, chains[ChainKey.SOLANA], origin)
          .then(sendResponse)
          .catch((error) => sendResponse({ error }));

        break;
      }
      case MessageKey.THOR_REQUEST: {
        handleRequest(message, chains[ChainKey.THORCHAIN], origin)
          .then(sendResponse)
          .catch((error) => sendResponse({ error }));

        break;
      }
      case MessageKey.PRIORITY: {
        handleSetPriority(message).then(sendResponse);

        break;
      }
      case MessageKey.VAULTS: {
        handleGetVaults().then(sendResponse);

        break;
      }
      default: {
        break;
      }
    }

    return true;
  },
);
