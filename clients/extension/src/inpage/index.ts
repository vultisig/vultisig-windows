import {
  CosmosMsgType,
  MessageKey,
  RequestMethod,
} from '@clients/extension/src/utils/constants'
import { getCosmosChainFromAddress } from '@clients/extension/src/utils/cosmos/getCosmosChainFromAddress'
import {
  Messaging,
  SendTransactionResponse,
  TransactionDetails,
  TransactionType,
  VaultExport,
} from '@clients/extension/src/utils/interfaces'
import { CosmosChain } from '@core/chain/Chain'
import { getCosmosAccountInfo } from '@core/chain/chains/cosmos/account/getCosmosAccountInfo'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { getChainByChainId } from '@core/chain/coin/ChainId'
import {
  CosmJSOfflineSigner,
  CosmJSOfflineSignerOnlyAmino,
  Keplr,
} from '@keplr-wallet/provider'
import {
  AminoSignResponse,
  BroadcastMode,
  DirectSignResponse,
  KeplrMode,
  KeplrSignOptions,
  Key,
  OfflineAminoSigner,
  OfflineDirectSigner,
  StdSignDoc,
  StdTx,
} from '@keplr-wallet/types'
import base58 from 'bs58'
import { TxBody } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { MsgTransfer } from 'cosmjs-types/ibc/applications/transfer/v1/tx'
import Long from 'long'
import { announceProvider, EIP1193Provider } from 'mipd'
import { v4 as uuidv4 } from 'uuid'

import { NetworkKey } from './constants'
import VULTI_ICON_RAW_SVG from './icon'
import { messengers } from './messenger'
import { Cosmos } from './providers/cosmos'
import { Dash } from './providers/dash'
import { Ethereum } from './providers/ethereum'
import { MAYAChain } from './providers/maya'
import { Solana } from './providers/solana'
import { THORChain } from './providers/thorchain'
import { UTXO } from './providers/utxo'
import { shouldInjectProvider } from './utils/injectHelpers'

export type Callback = (
  error: Error | null,
  result?: Messaging.Chain.Response
) => void

class XDEFIMessageRequester {
  constructor() {
    this.sendMessage = this.sendMessage.bind(this)
  }
  // Expected for Ctrl
  public async sendMessage(_message: any, _params: any): Promise<void> {
    return new Promise(resolve => {
      resolve()
    })
  }
}

class XDEFIKeplrProvider extends Keplr {
  static instance: XDEFIKeplrProvider | null = null
  isXDEFI: boolean
  isVulticonnect: boolean

  public static getInstance(): XDEFIKeplrProvider {
    if (!XDEFIKeplrProvider.instance) {
      XDEFIKeplrProvider.instance = new XDEFIKeplrProvider(
        '0.0.1',
        'extension',
        new XDEFIMessageRequester()
      )
    }
    return XDEFIKeplrProvider.instance
  }

  emitAccountsChanged(): void {
    window.dispatchEvent(new Event('keplr_keystorechange'))
  }

  constructor(version: string, mode: KeplrMode, requester: any) {
    super(version, mode, requester)
    this.isXDEFI = true
    this.isVulticonnect = true
    window.ctrlKeplrProviders = {}
    window.ctrlKeplrProviders['Ctrl Wallet'] = this
  }
  enable(_chainIds: string | string[]): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      cosmosProvider
        .request({
          method: RequestMethod.VULTISIG.REQUEST_ACCOUNTS,
          params: [],
        })
        .then(resolve)
        .catch(reject)
    })
  }
  getOfflineSigner(
    chainId: string,
    _signOptions?: KeplrSignOptions
  ): OfflineAminoSigner & OfflineDirectSigner {
    const cosmSigner = new CosmJSOfflineSigner(
      chainId,
      window.xfi.keplr,
      _signOptions
    )

    cosmSigner.getAccounts = async () => {
      return cosmosProvider
        .request({ method: RequestMethod.VULTISIG.CHAIN_ID, params: [] })
        .then(async currentChainID => {
          if (currentChainID !== chainId) {
            return await cosmosProvider
              .request({
                method: RequestMethod.VULTISIG.WALLET_SWITCH_CHAIN,
                params: [{ chainId }],
              })
              .then(async () => {
                return await cosmosProvider.request({
                  method: RequestMethod.VULTISIG.REQUEST_ACCOUNTS,
                  params: [],
                })
              })
          } else {
            return await cosmosProvider.request({
              method: RequestMethod.VULTISIG.REQUEST_ACCOUNTS,
              params: [],
            })
          }
        })
    }

    return cosmSigner as OfflineAminoSigner & OfflineDirectSigner
  }

  getOfflineSignerOnlyAmino(
    chainId: string,
    signOptions?: KeplrSignOptions
  ): OfflineAminoSigner {
    const cosmSigner = new CosmJSOfflineSignerOnlyAmino(
      chainId,
      window.xfi.keplr,
      signOptions
    )

    cosmSigner.getAccounts = async () => {
      return cosmosProvider
        .request({ method: RequestMethod.VULTISIG.CHAIN_ID, params: [] })
        .then(async currentChainID => {
          if (currentChainID !== chainId) {
            return await cosmosProvider
              .request({
                method: RequestMethod.VULTISIG.WALLET_SWITCH_CHAIN,
                params: [{ chainId }],
              })
              .then(async () => {
                return await cosmosProvider.request({
                  method: RequestMethod.VULTISIG.REQUEST_ACCOUNTS,
                  params: [],
                })
              })
          } else {
            return await cosmosProvider.request({
              method: RequestMethod.VULTISIG.REQUEST_ACCOUNTS,
              params: [],
            })
          }
        })
    }

    return cosmSigner as OfflineAminoSigner
  }

  sendTx(
    _chainId: string,
    _tx: StdTx | Uint8Array,
    _mode: BroadcastMode
  ): Promise<Uint8Array> {
    return new Promise<Uint8Array>((resolve, reject) => {
      cosmosProvider
        .request({
          method: RequestMethod.VULTISIG.SEND_TRANSACTION,
          params: [{ ..._tx, txType: 'Keplr' }],
        })
        .then((result: SendTransactionResponse) => {
          const decoded = base58.decode(result.raw)
          if (decoded) resolve(decoded)
          else reject()
        })
        .catch(reject)
    })
  }
  async sendMessage() {}

  signAmino(
    _chainId: string,
    _signer: string,
    signDoc: StdSignDoc,
    _signOptions?: KeplrSignOptions
  ): Promise<AminoSignResponse> {
    return new Promise<AminoSignResponse>(resolve => {
      const txDetails = signDoc.msgs.map(msg => {
        if (msg.type === CosmosMsgType.MSG_SEND) {
          return { txType: 'Keplr', ...msg.value } as TransactionType.Keplr
        }
      })

      cosmosProvider
        .request({
          method: RequestMethod.VULTISIG.SEND_TRANSACTION,
          params: [{ ...txDetails[0]!, txType: 'Keplr' }],
        })
        .then((result: SendTransactionResponse) => {
          resolve(result as any)
        })
    })
  }
  async signDirect(
    chainId: string,
    signer: string,
    signDoc: {
      bodyBytes: Uint8Array
      authInfoBytes: Uint8Array
      chainId: string
      accountNumber: Long
    },
    _signOptions: KeplrSignOptions
  ): Promise<DirectSignResponse> {
    const txBody = TxBody.decode(signDoc.bodyBytes)

    const [firstMessage] = txBody.messages
    if (
      !firstMessage ||
      firstMessage.typeUrl !== '/ibc.applications.transfer.v1.MsgTransfer'
    ) {
      throw new Error('Unsupported message type')
    }

    const txChain = getChainByChainId(chainId)
    if (!txChain) {
      throw new Error(`Chain not supported: ${chainId}`)
    }

    const msg = MsgTransfer.decode(firstMessage.value)
    const receiverChain = getCosmosChainFromAddress(msg.receiver)
    if (!receiverChain) {
      throw new Error(`Receiver chain not supported: ${msg.receiver}`)
    }

    const standardTx: TransactionDetails = {
      asset: {
        chain: txChain,
        ticker: msg.token.denom,
      },
      amount: {
        amount: msg.token.amount,
        decimals: chainFeeCoin[txChain].decimals,
      },
      from: msg.sender,
      to: msg.receiver,
      data: `${receiverChain}:${msg.sourceChannel}:${msg.receiver}:${msg.memo}`,
      ibcTransaction: {
        ...msg,
        timeoutHeight: {
          revisionHeight: msg.timeoutHeight.revisionHeight.toString(),
          revisionNumber: msg.timeoutHeight.revisionNumber.toString(),
        },
        timeoutTimestamp: msg.timeoutTimestamp.toString(),
      },
    }

    const result: SendTransactionResponse = await cosmosProvider.request({
      method: RequestMethod.VULTISIG.SEND_TRANSACTION,
      params: [{ ...standardTx, txType: 'Vultisig' }],
    })

    const accountInfo = await getCosmosAccountInfo({
      chain: txChain as CosmosChain,
      address: signer,
    })

    if (!accountInfo || !accountInfo.pubkey) {
      throw new Error('No account info or pubkey')
    }

    const decoded = base58.decode(result.raw)
    if (!decoded) {
      throw new Error('Invalid signature')
    }

    return {
      signed: signDoc,
      signature: {
        pub_key: accountInfo.pubkey,
        signature: decoded.toString(),
      },
    }
  }
  async experimentalSuggestChain(_chainInfo: any) {
    return
  }
  async sendSimpleMessage(
    _type: string,
    _method: string,
    _payload: any
  ): Promise<any> {
    return
  }

  async getKey(chainId: string): Promise<Key> {
    return cosmosProvider
      .request({ method: RequestMethod.VULTISIG.CHAIN_ID, params: [] })
      .then(async currentChainID => {
        if (currentChainID !== chainId) {
          return await cosmosProvider
            .request({
              method: RequestMethod.VULTISIG.WALLET_SWITCH_CHAIN,
              params: [{ chainId }],
            })
            .then(async () => {
              return (
                await cosmosProvider.request({
                  method: RequestMethod.VULTISIG.REQUEST_ACCOUNTS,
                  params: [],
                })
              )[0]
            })
        } else {
          return (
            await cosmosProvider.request({
              method: RequestMethod.VULTISIG.REQUEST_ACCOUNTS,
              params: [],
            })
          )[0]
        }
      })
  }
}

const bitcoinProvider = new UTXO(
  MessageKey.BITCOIN_REQUEST,
  'Bitcoin_bitcoin-mainnet'
)
const bitcoinCashProvider = new UTXO(
  MessageKey.BITCOIN_CASH_REQUEST,
  'Bitcoincash_bitcoincash'
)
const cosmosProvider = new Cosmos()
const dashProvider = new Dash()
const dogecoinProvider = new UTXO(
  MessageKey.DOGECOIN_REQUEST,
  'Dogecoin_dogecoin'
)
const ethereumProvider = new Ethereum()
const litecoinProvider = new UTXO(
  MessageKey.LITECOIN_REQUEST,
  'Litecoin_litecoin'
)
const mayachainProvider = new MAYAChain()
const solanaProvider = new Solana()
const thorchainProvider = new THORChain()
const keplrProvider = XDEFIKeplrProvider.getInstance()

const phantomProvider = {
  bitcoin: bitcoinProvider,
  ethereum: ethereumProvider,
  solana: solanaProvider,
}

const xfiProvider = {
  bitcoin: bitcoinProvider,
  bitcoincash: bitcoinCashProvider,
  cosmos: cosmosProvider,
  dogecoin: dogecoinProvider,
  ethereum: ethereumProvider,
  litecoin: litecoinProvider,
  mayachain: mayachainProvider,
  solana: solanaProvider,
  thorchain: thorchainProvider,
  keplr: keplrProvider,
  info: {
    installed: true,
    isCtrl: false,
    isVultiConnect: true,
    network: NetworkKey.MAINNET,
    version: '0.0.1',
  },
  installed: true,
}

const vultisigProvider = {
  bitcoin: bitcoinProvider,
  bitcoincash: bitcoinCashProvider,
  cosmos: cosmosProvider,
  dash: dashProvider,
  dogecoin: dogecoinProvider,
  ethereum: ethereumProvider,
  litecoin: litecoinProvider,
  maya: mayachainProvider,
  solana: solanaProvider,
  thorchain: thorchainProvider,
  getVault: async (): Promise<Messaging.GetVault.Response> => {
    return await messengers.background.send<
      Messaging.GetVault.Request,
      Messaging.GetVault.Response
    >(
      'providerRequest',
      {
        type: MessageKey.VAULT,
        message: {},
      },
      { id: uuidv4() }
    )
  },
  getVaults: async (): Promise<VaultExport[]> => {
    return await messengers.background.send<
      Messaging.GetVaults.Request,
      Messaging.GetVaults.Response
    >(
      'providerRequest',
      {
        type: MessageKey.VAULTS,
        message: {},
      },
      { id: uuidv4() }
    )
  },
}

if (shouldInjectProvider()) {
  Object.defineProperty(window, 'vultisig', {
    value: vultisigProvider,
    configurable: false,
    enumerable: false,
    writable: false,
  })

  if (!window.ethereum) {
    Object.defineProperty(window, 'ethereum', {
      value: ethereumProvider,
      configurable: true,
      enumerable: true,
      writable: true,
    })
  }

  announceProvider({
    info: {
      icon: VULTI_ICON_RAW_SVG,
      name: 'Vultisig',
      rdns: 'me.vultisig',
      uuid: uuidv4(),
    },
    provider: ethereumProvider as Ethereum as EIP1193Provider,
  })

  window.dispatchEvent(new Event('vulticonnect:inpage:ready'))

  messengers.contentScript.reply(
    'setDefaultProvider',
    async ({
      vultisigDefaultProvider,
    }: {
      vultisigDefaultProvider: boolean
    }) => {
      if (vultisigDefaultProvider) {
        const providerCopy = Object.create(
          Object.getPrototypeOf(ethereumProvider),
          Object.getOwnPropertyDescriptors(ethereumProvider)
        )
        providerCopy.isMetaMask = false
        announceProvider({
          info: {
            icon: VULTI_ICON_RAW_SVG,
            name: 'Vultisig',
            rdns: 'me.vultisig',
            uuid: uuidv4(),
          },
          provider: providerCopy as Ethereum as EIP1193Provider,
        })

        announceProvider({
          info: {
            icon: VULTI_ICON_RAW_SVG,
            name: 'Ctrl Wallet',
            rdns: 'io.xdefi',
            uuid: uuidv4(),
          },
          provider: providerCopy as Ethereum as EIP1193Provider,
        })

        Object.defineProperties(window, {
          ethereum: {
            get() {
              return window.vultiConnectRouter.currentProvider
            },
            set(newProvider) {
              window.vultiConnectRouter?.addProvider(newProvider)
            },
            configurable: false,
          },
          xfi: {
            value: xfiProvider,
            configurable: false,
            writable: false,
          },
          isCtrl: {
            value: true,
            configurable: false,
            writable: false,
          },
          vultiConnectRouter: {
            value: {
              ethereumProvider,
              lastInjectedProvider: window.ethereum,
              currentProvider: ethereumProvider,
              providers: [
                ethereumProvider,
                ...(window.ethereum ? [window.ethereum] : []),
              ],
              setDefaultProvider(vultiAsDefault: boolean) {
                window.vultiConnectRouter.currentProvider = vultiAsDefault
                  ? (window.vultisig?.ethereum ?? ethereumProvider)
                  : (window.vultiConnectRouter?.lastInjectedProvider ??
                    window.ethereum)
              },
              addProvider(provider: Ethereum) {
                if (!window.vultiConnectRouter.providers.includes(provider)) {
                  window.vultiConnectRouter.providers.push(provider)
                }
                if (ethereumProvider !== provider) {
                  window.vultiConnectRouter.lastInjectedProvider = provider
                }
              },
            },
            configurable: false,
            writable: false,
          },
          bitcoin: {
            value: bitcoinProvider,
            configurable: false,
            writable: false,
          },
          bitcoincash: {
            value: bitcoinCashProvider,
            configurable: false,
            writable: false,
          },
          cosmos: {
            value: cosmosProvider,
            configurable: false,
            writable: false,
          },
          dash: {
            value: dashProvider,
            configurable: false,
            writable: false,
          },
          dogecoin: {
            value: dogecoinProvider,
            configurable: false,
            writable: false,
          },
          litecoin: {
            value: litecoinProvider,
            configurable: false,
            writable: false,
          },
          maya: {
            value: mayachainProvider,
            configurable: false,
            writable: false,
          },
          thorchain: {
            value: thorchainProvider,
            configurable: false,
            writable: false,
          },
          phantom: {
            value: phantomProvider,
            configurable: false,
            writable: false,
          },
          keplr: {
            value: keplrProvider,
            configurable: false,
            writable: false,
          },
        })
      }
    }
  )
}
