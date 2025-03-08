import VULTI_ICON_RAW_PNG from '@clients/extension/src/content/icon'
import {
  ThorchainProviderRequest,
  ThorchainProviderResponse,
} from '@clients/extension/src/types/thorchain'
import { ThorchainProviderMethod } from '@clients/extension/src/types/thorchain'
import {
  CosmosMsgType,
  EventMethod,
  MessageKey,
  RequestMethod,
  SenderKey,
} from '@clients/extension/src/utils/constants'
import { processBackgroundResponse } from '@clients/extension/src/utils/functions'
import {
  Messaging,
  SendTransactionResponse,
  TransactionType,
  VaultProps,
} from '@clients/extension/src/utils/interfaces'
import { Chain } from '@core/chain/Chain'
import { rootApiUrl } from '@core/config'
import {
  CosmJSOfflineSigner,
  CosmJSOfflineSignerOnlyAmino,
  Keplr,
} from '@keplr-wallet/provider'
import {
  AminoSignResponse,
  BroadcastMode,
  KeplrMode,
  KeplrSignOptions,
  Key,
  OfflineAminoSigner,
  OfflineDirectSigner,
  StdSignDoc,
  StdTx,
} from '@keplr-wallet/types'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAccount,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import {
  Connection,
  PublicKey,
  SystemInstruction,
  SystemProgram,
  Transaction,
  VersionedTransaction,
} from '@solana/web3.js'
import base58 from 'bs58'
import EventEmitter from 'events'
import { announceProvider, EIP1193Provider } from 'mipd'
import { v4 as uuidv4 } from 'uuid'

enum NetworkKey {
  MAINNET = 'mainnet',
  TESTNET = 'testnet',
}
window.ctrlKeplrProviders = {}
type Callback = (error: Error | null, result?: Messaging.Chain.Response) => void

const sendToBackgroundViaRelay = <Request, Response>(
  type: MessageKey,
  message: Request
): Promise<Response> => {
  return new Promise((resolve, reject) => {
    const id = uuidv4()

    const callback = ({
      data,
      source,
    }: MessageEvent<{
      error: string
      id: string
      message: Response
      sender: SenderKey
      type: MessageKey
    }>) => {
      if (
        source !== window ||
        data.id !== id ||
        data.sender !== SenderKey.RELAY ||
        data.type !== type
      )
        return

      window.removeEventListener('message', callback)

      if (data.error) {
        reject(data.error)
      } else {
        resolve(data.message)
      }
    }

    window.postMessage({ id, message, sender: SenderKey.PAGE, type }, '*')

    window.addEventListener('message', callback)
  })
}

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

namespace Provider {
  export class UTXO extends EventEmitter {
    public chainId: string
    public network: string
    public requestAccounts
    private providerType: MessageKey
    public static instances: Map<string, UTXO>
    constructor(providerType: string, chainId: string) {
      super()
      this.providerType = providerType as MessageKey
      this.chainId = chainId
      this.network = NetworkKey.MAINNET
      this.requestAccounts = this.getAccounts
    }

    static getInstance(providerType: string, chainId: string): UTXO {
      if (!UTXO.instances) {
        UTXO.instances = new Map<string, UTXO>()
      }

      if (!UTXO.instances.has(providerType)) {
        UTXO.instances.set(providerType, new UTXO(providerType, chainId))
      }
      return UTXO.instances.get(providerType)!
    }

    async getAccounts() {
      return await this.request({
        method: RequestMethod.VULTISIG.GET_ACCOUNTS,
        params: [],
      })
    }

    async signPsbt() {
      return await this.request({
        method: RequestMethod.CTRL.SIGN_PSBT,
        params: [],
      })
    }

    changeNetwork(network: NetworkKey) {
      if (network !== NetworkKey.MAINNET && network !== NetworkKey.TESTNET)
        throw Error(`Invalid network ${network}`)
      else if (network === NetworkKey.TESTNET)
        throw Error(`We only support the ${NetworkKey.MAINNET} network.`)

      this.chainId = `Bitcoin_bitcoin-${network}`
      this.network = network
      this.emit(EventMethod.CHAIN_CHANGED, { chainId: this.chainId, network })
    }

    emitAccountsChanged() {
      this.emit(EventMethod.ACCOUNTS_CHANGED, {})
    }

    async request(data: Messaging.Chain.Request, callback?: Callback) {
      return await sendToBackgroundViaRelay<
        Messaging.Chain.Request,
        Messaging.Chain.Response
      >(this.providerType, data)
        .then(response => {
          const result = processBackgroundResponse(
            data,
            this.providerType,
            response
          )
          if (callback) callback(null, result)

          return result
        })
        .catch(error => {
          if (callback) callback(error)

          return error
        })
    }
  }

  export class Cosmos extends EventEmitter {
    public isVultiConnect: boolean

    constructor() {
      super()
      this.isVultiConnect = true
    }

    async request(data: Messaging.Chain.Request, callback?: Callback) {
      return await sendToBackgroundViaRelay<
        Messaging.Chain.Request,
        Messaging.Chain.Response
      >(MessageKey.COSMOS_REQUEST, data)
        .then(response => {
          const result = processBackgroundResponse(
            data,
            MessageKey.COSMOS_REQUEST,
            response
          )
          if (callback) callback(null, result)

          return result
        })
        .catch(error => {
          if (callback) callback(error)

          return error
        })
    }
  }

  export class Dash extends EventEmitter {
    public chainId: string
    public network: string
    public static instance: Dash | null = null
    constructor() {
      super()
      this.chainId = 'Dash_dash'
      this.network = NetworkKey.MAINNET
    }

    static getInstance(): Dash {
      if (!Dash.instance) {
        Dash.instance = new Dash()
      }
      return Dash.instance
    }

    emitAccountsChanged() {
      this.emit(EventMethod.ACCOUNTS_CHANGED, {})
    }

    async request(data: Messaging.Chain.Request, callback?: Callback) {
      return await sendToBackgroundViaRelay<
        Messaging.Chain.Request,
        Messaging.Chain.Response
      >(MessageKey.DASH_REQUEST, data)
        .then(response => {
          const result = processBackgroundResponse(
            data,
            MessageKey.DASH_REQUEST,
            response
          )
          if (callback) callback(null, result)

          return result
        })
        .catch(error => {
          if (callback) callback(error)

          return error
        })
    }
  }

  export class Ethereum extends EventEmitter {
    public chainId: string
    public connected: boolean
    public isCtrl: boolean
    public isMetaMask: boolean
    public isVultiConnect: boolean
    public isXDEFI: boolean
    public networkVersion: string
    public selectedAddress: string
    public sendAsync
    public static instance: Ethereum | null = null

    constructor() {
      super()
      this.chainId = '0x1'
      this.connected = false
      this.isCtrl = true
      this.isMetaMask = true
      this.isVultiConnect = true
      this.isXDEFI = true
      this.networkVersion = '1'
      this.selectedAddress = ''

      this.sendAsync = this.request
    }

    static getInstance(_chain: string): Ethereum {
      if (!Ethereum.instance) {
        Ethereum.instance = new Ethereum()
      }
      window.ctrlEthProviders['Ctrl Wallet'] = Ethereum.instance
      window.isCtrl = true
      return Ethereum.instance
    }

    async enable() {
      return await this.request({
        method: RequestMethod.METAMASK.ETH_REQUEST_ACCOUNTS,
        params: [],
      })
    }

    emitAccountsChanged(addresses: string[]) {
      if (addresses.length) {
        const [address] = addresses

        this.selectedAddress = address ?? ''
        this.emit(EventMethod.ACCOUNTS_CHANGED, address ? [address] : [])
      } else {
        this.selectedAddress = ''
        this.emit(EventMethod.ACCOUNTS_CHANGED, [])
      }
    }

    emitUpdateNetwork({ chainId }: { chainId: string }) {
      if (Number(chainId) && this.chainId !== chainId) this.chainId = chainId

      this.emit(EventMethod.NETWORK_CHANGED, Number(this.chainId))
      this.emit(EventMethod.CHAIN_CHANGED, this.chainId)
    }

    isConnected() {
      return this.connected
    }

    on = (event: string, callback: (data: any) => void): this => {
      if (event === EventMethod.CONNECT && this.isConnected()) {
        this.request({
          method: RequestMethod.METAMASK.ETH_CHAIN_ID,
          params: [],
        }).then(chainId => callback({ chainId }))
      } else {
        super.on(event, callback)
      }

      return this
    }

    async send(x: any, y: any) {
      if (typeof x === 'string') {
        return await this.request({
          method: x,
          params: y ?? [],
        })
      } else if (typeof y === 'function') {
        this.request(x, y)
      } else {
        return await this.request(x)
      }
    }

    async request(data: Messaging.Chain.Request, callback?: Callback) {
      return await sendToBackgroundViaRelay<
        Messaging.Chain.Request,
        Messaging.Chain.Response
      >(MessageKey.ETHEREUM_REQUEST, data)
        .then(response => {
          const result = processBackgroundResponse(
            data,
            MessageKey.ETHEREUM_REQUEST,
            response
          )
          switch (data.method) {
            case RequestMethod.METAMASK.WALLET_ADD_ETHEREUM_CHAIN:
            case RequestMethod.METAMASK.WALLET_SWITCH_ETHEREUM_CHAIN: {
              this.emitUpdateNetwork({ chainId: result as string })

              break
            }
            case RequestMethod.METAMASK.WALLET_REVOKE_PERMISSIONS: {
              this.emit(EventMethod.DISCONNECT, result)

              break
            }
          }

          if (callback) callback(null, result)

          return result
        })
        .catch(error => {
          if (callback) callback(error)

          return error
        })
    }

    _connect = (): void => {
      this.emit(EventMethod.CONNECT, '')
    }

    _disconnect = (error?: { code: number; message: string }): void => {
      this.emit(
        EventMethod.DISCONNECT,
        error || { code: 4900, message: 'Provider disconnected' }
      )
    }
  }

  export class Solana extends EventEmitter {
    public chainId: string
    public isConnected: boolean
    public isPhantom: boolean
    public isXDEFI: boolean
    public network: string
    public publicKey?: PublicKey
    public static instance: Solana | null = null
    constructor() {
      super()
      this.chainId = 'Solana_mainnet-beta'
      this.isConnected = false
      this.isPhantom = true
      this.isXDEFI = true
      this.network = NetworkKey.MAINNET
    }

    static getInstance(): Solana {
      if (!Solana.instance) {
        Solana.instance = new Solana()
      }
      return Solana.instance
    }

    async signTransaction(transaction: Transaction) {
      const connection = new Connection(`${rootApiUrl}/solana/`)
      for (const instruction of transaction.instructions) {
        let modifiedTransfer: TransactionType.Phantom

        if (instruction.programId.equals(SystemProgram.programId)) {
          // Handle Native SOL Transfers
          const decodedTransfer = SystemInstruction.decodeTransfer(instruction)
          modifiedTransfer = {
            txType: 'Phantom',
            asset: { chain: Chain.Solana, ticker: 'SOL' },
            amount: decodedTransfer.lamports.toString(),
            from: decodedTransfer.fromPubkey.toString(),
            to: decodedTransfer.toPubkey.toString(),
          }
        } else if (instruction.programId.equals(TOKEN_PROGRAM_ID)) {
          //  Handle SPL Token Transfers
          const senderTokenAccountInfo = await getAccount(
            connection,
            new PublicKey(instruction.keys[0].pubkey)
          )
          let recipient: string
          try {
            // Try fetching receiver account
            const receiverTokenAccountInfo = await getAccount(
              connection,
              new PublicKey(instruction.keys[2].pubkey)
            )
            recipient = receiverTokenAccountInfo.owner.toString()
          } catch {
            console.warn(
              'Receiver token account not found. Checking for ATA...'
            )
            const ataInstruction = transaction.instructions.find(instr =>
              instr.programId.equals(ASSOCIATED_TOKEN_PROGRAM_ID)
            )
            if (ataInstruction) {
              // The recipient should be in the ATA instruction's keys[0] (payer) or keys[2] (owner)
              recipient = ataInstruction.keys[2].pubkey.toString()
            } else {
              throw new Error(
                'Unable to determine recipient address. No direct token account or ATA instruction found.'
              )
            }
          }

          const amountBytes = instruction.data.slice(1, 9)
          const amount = new DataView(
            Uint8Array.from(amountBytes).buffer
          ).getBigUint64(0, true)

          modifiedTransfer = {
            txType: 'Phantom',
            amount: amount.toString(),
            asset: {
              chain: Chain.Solana,
              mint: senderTokenAccountInfo.mint.toString(),
            },
            from: senderTokenAccountInfo.owner.toString(),
            to: recipient,
          }
        } else {
          continue
        }
        return await this.request({
          method: RequestMethod.VULTISIG.SEND_TRANSACTION,
          params: [modifiedTransfer],
        }).then((result: SendTransactionResponse) => {
          const rawData = base58.decode(result.raw)
          return VersionedTransaction.deserialize(rawData)
        })
      }
    }

    async connect() {
      return await this.request({
        method: RequestMethod.VULTISIG.REQUEST_ACCOUNTS,
        params: [],
      }).then(account => {
        this.isConnected = true
        this.publicKey = new PublicKey(account)
        this.emit(EventMethod.CONNECT, this.publicKey)

        return { publicKey: this.publicKey }
      })
    }

    async disconnect() {
      this.isConnected = false
      this.publicKey = undefined
      this.emit(EventMethod.DISCONNECT)

      await Promise.resolve()
    }

    async request(data: Messaging.Chain.Request, callback?: Callback) {
      return await sendToBackgroundViaRelay<
        Messaging.Chain.Request,
        Messaging.Chain.Response
      >(MessageKey.SOLANA_REQUEST, data)
        .then(response => {
          const result = processBackgroundResponse(
            data,
            MessageKey.SOLANA_REQUEST,
            response
          )
          if (callback) callback(null, result)

          return result
        })
        .catch(error => {
          if (callback) callback(error)

          return error
        })
    }

    async signAllTransactions(transactions: Transaction[]) {
      if (!transactions || !transactions.length) {
        return Promise.reject({
          code: -32000,
          message: 'Missing or invalid parameters.',
        })
      }

      const results: VersionedTransaction[] = []

      for (const transaction of transactions) {
        const result = await this.signTransaction(transaction)
        if (result) {
          results.push(result)
        } else {
          throw new Error(
            'Failed to sign transaction: No matching instructions found'
          )
        }
      }

      return results
    }

    async signAndSendTransaction() {
      return Promise.reject({
        code: -32603,
        message: 'This function is not supported by Vultisig',
      })
    }

    async signAndSendAllTransactions() {
      return Promise.reject({
        code: -32603,
        message: 'This function is not supported by Vultisig',
      })
    }

    async signMessage() {
      return Promise.reject({
        code: -32603,
        message: 'This function is not supported by Vultisig',
      })
    }

    async signIn() {
      return Promise.reject({
        code: -32603,
        message: 'This function is not supported by Vultisig',
      })
    }

    async handleNotification() {
      return Promise.reject({
        code: -32603,
        message: 'This function is not supported by Vultisig',
      })
    }
  }

  export class MAYAChain extends EventEmitter {
    public chainId: string
    public network: string
    public static instance: MAYAChain | null = null
    constructor() {
      super()
      this.chainId = 'Thorchain_mayachain'
      this.network = NetworkKey.MAINNET
    }

    getInstace(): MAYAChain {
      if (!MAYAChain.instance) {
        MAYAChain.instance = new MAYAChain()
      }
      return MAYAChain.instance
    }

    changeNetwork(network: NetworkKey) {
      if (network !== NetworkKey.MAINNET && network !== NetworkKey.TESTNET)
        throw Error(`Invalid network ${network}`)
      else if (network === NetworkKey.TESTNET)
        throw Error(`We only support the ${NetworkKey.MAINNET} network.`)

      this.network = network
      this.emit(EventMethod.CHAIN_CHANGED, { chainId: this.chainId, network })
    }

    emitAccountsChanged() {
      this.emit(EventMethod.ACCOUNTS_CHANGED, {})
    }

    async request<T extends ThorchainProviderMethod>(
      data: ThorchainProviderRequest<T>,
      callback?: (
        error: Error | null,
        result?: ThorchainProviderResponse<T>
      ) => void
    ): Promise<ThorchainProviderResponse<T>> {
      return await sendToBackgroundViaRelay<
        ThorchainProviderRequest<T>,
        ThorchainProviderResponse<T>
      >(MessageKey.MAYA_REQUEST, data)
        .then(response => {
          const result = processBackgroundResponse(
            data,
            MessageKey.MAYA_REQUEST,
            response
          )
          if (callback) callback(null, result)

          return result
        })
        .catch(error => {
          if (callback) callback(error)

          return error
        })
    }
  }

  export class THORChain extends EventEmitter {
    public chainId: string
    public network: NetworkKey
    public static instance: THORChain | null = null
    constructor() {
      super()
      this.chainId = 'Thorchain_thorchain'
      this.network = NetworkKey.MAINNET
    }

    static getInstance(): THORChain {
      if (!THORChain.instance) {
        THORChain.instance = new THORChain()
      }
      return THORChain.instance
    }

    changeNetwork(network: NetworkKey) {
      if (network !== NetworkKey.MAINNET && network !== NetworkKey.TESTNET)
        throw Error(`Invalid network ${network}`)
      else if (network === NetworkKey.TESTNET)
        throw Error(`We only support the ${NetworkKey.MAINNET} network.`)

      this.network = network
      this.emit(EventMethod.CHAIN_CHANGED, { chainId: this.chainId, network })
    }

    emitAccountsChanged() {
      this.emit(EventMethod.ACCOUNTS_CHANGED, {})
    }

    async request<T extends ThorchainProviderMethod>(
      data: ThorchainProviderRequest<T>,
      callback?: (
        error: Error | null,
        result?: ThorchainProviderResponse<T>
      ) => void
    ): Promise<ThorchainProviderResponse<T>> {
      return await sendToBackgroundViaRelay<
        ThorchainProviderRequest<T>,
        ThorchainProviderResponse<T>
      >(MessageKey.THOR_REQUEST, data)
        .then(response => {
          const result = processBackgroundResponse(
            data,
            MessageKey.THOR_REQUEST,
            response
          )
          if (callback) callback(null, result)
          return result
        })
        .catch(error => {
          if (callback) callback(error)
          return error
        })
    }
  }
}

const bitcoinProvider = new Provider.UTXO(
  MessageKey.BITCOIN_REQUEST,
  'Bitcoin_bitcoin-mainnet'
)
const bitcoinCashProvider = new Provider.UTXO(
  MessageKey.BITCOIN_CASH_REQUEST,
  'Bitcoincash_bitcoincash'
)
const cosmosProvider = new Provider.Cosmos()
const dashProvider = new Provider.Dash()
const dogecoinProvider = new Provider.UTXO(
  MessageKey.DOGECOIN_REQUEST,
  'Dogecoin_dogecoin'
)
const ethereumProvider = new Provider.Ethereum()
const litecoinProvider = new Provider.UTXO(
  MessageKey.LITECOIN_REQUEST,
  'Litecoin_litecoin'
)
const mayachainProvider = new Provider.MAYAChain()
const solanaProvider = new Provider.Solana()
const thorchainProvider = new Provider.THORChain()
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
  getVault: (): Promise<Messaging.GetVault.Response> => {
    return new Promise(resolve => {
      sendToBackgroundViaRelay<
        Messaging.GetVault.Request,
        Messaging.GetVault.Response
      >(MessageKey.VAULT, {}).then(vaults => resolve(vaults))
    })
  },
  getVaults: (): Promise<VaultProps[]> => {
    return new Promise(resolve => {
      sendToBackgroundViaRelay<
        Messaging.GetVaults.Request,
        Messaging.GetVaults.Response
      >(MessageKey.VAULTS, {}).then(vaults => resolve(vaults))
    })
  },
}

window.vultisig = vultisigProvider
window.xfi = xfiProvider
window.xfi.kepler = keplrProvider

announceProvider({
  info: {
    icon: VULTI_ICON_RAW_PNG,
    name: 'Vultisig',
    rdns: 'me.vultisig',
    uuid: uuidv4(),
  },
  provider: ethereumProvider as Provider.Ethereum as EIP1193Provider,
})

let prioritize: boolean = true

const intervalRef = setInterval(() => {
  if ((window.ethereum && window.vultisig) || prioritize == false)
    clearInterval(intervalRef)

  sendToBackgroundViaRelay<
    Messaging.SetPriority.Request,
    Messaging.SetPriority.Response
  >(MessageKey.PRIORITY, {})
    .then(res => {
      if (res) {
        const providerCopy = Object.create(
          Object.getPrototypeOf(ethereumProvider),
          Object.getOwnPropertyDescriptors(ethereumProvider)
        )

        providerCopy.isMetaMask = false
        window.isCtrl = true
        window.xfi.installed = true
        announceProvider({
          info: {
            icon: VULTI_ICON_RAW_PNG,
            name: 'Vultisig',
            rdns: 'me.vultisig',
            uuid: uuidv4(),
          },
          provider: providerCopy as Provider.Ethereum as EIP1193Provider,
        })
        announceProvider({
          info: {
            icon: VULTI_ICON_RAW_PNG,
            name: 'Ctrl Wallet',
            rdns: 'io.xdefi',
            uuid: uuidv4(),
          },
          provider: providerCopy as Provider.Ethereum as EIP1193Provider,
        })

        if (document.readyState === 'complete') {
          Object.defineProperties(window, {
            vultisig: {
              value: vultisigProvider,
              configurable: false,
              writable: false,
            },
            ethereum: {
              get() {
                return window.vultiConnectRouter.currentProvider
              },
              set(newProvider) {
                window.vultiConnectRouter?.addProvider(newProvider)
              },
              configurable: false,
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
                  if (vultiAsDefault) {
                    window.vultiConnectRouter.currentProvider = window.vultisig
                  } else {
                    const nonDefaultProvider =
                      window.vultiConnectRouter?.lastInjectedProvider ??
                      window.ethereum
                    window.vultiConnectRouter.currentProvider =
                      nonDefaultProvider
                  }
                },
                addProvider(provider: Provider.Ethereum) {
                  if (
                    !window.vultiConnectRouter?.providers?.includes(provider)
                  ) {
                    window.vultiConnectRouter?.providers?.push(provider)
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
              value: { ...bitcoinProvider },
              configurable: false,
              writable: false,
            },
            bitcoincash: {
              value: { ...bitcoinCashProvider },
              configurable: false,
              writable: false,
            },
            cosmos: {
              value: { ...cosmosProvider },
              configurable: false,
              writable: false,
            },
            dash: {
              value: { ...dashProvider },
              configurable: false,
              writable: false,
            },
            dogecoin: {
              value: { ...dogecoinProvider },
              configurable: false,
              writable: false,
            },
            litecoin: {
              value: { ...litecoinProvider },
              configurable: false,
              writable: false,
            },
            maya: {
              value: { ...mayachainProvider },
              configurable: false,
              writable: false,
            },
            thorchain: {
              value: { ...thorchainProvider },
              configurable: false,
              writable: false,
            },
            phantom: {
              value: { ...phantomProvider },
              configurable: false,
              writable: false,
            },
          })
        } else {
          window.addEventListener(
            'load',
            () => {
              Object.defineProperties(window, {
                vultisig: {
                  value: vultisigProvider,
                  configurable: false,
                  writable: false,
                },
                ethereum: {
                  get() {
                    return window.vultiConnectRouter.currentProvider
                  },
                  set(newProvider) {
                    window.vultiConnectRouter?.addProvider(newProvider)
                  },
                  configurable: false,
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
                      if (vultiAsDefault) {
                        window.vultiConnectRouter.currentProvider =
                          window.vultisig
                      } else {
                        const nonDefaultProvider =
                          window.vultiConnectRouter?.lastInjectedProvider ??
                          window.ethereum
                        window.vultiConnectRouter.currentProvider =
                          nonDefaultProvider
                      }
                    },
                    addProvider(provider: Provider.Ethereum) {
                      if (
                        !window.vultiConnectRouter?.providers?.includes(
                          provider
                        )
                      ) {
                        window.vultiConnectRouter?.providers?.push(provider)
                      }
                      if (ethereumProvider !== provider) {
                        window.vultiConnectRouter.lastInjectedProvider =
                          provider
                      }
                    },
                  },
                  configurable: false,
                  writable: false,
                },
                bitcoin: {
                  value: { ...bitcoinProvider },
                  configurable: false,
                  writable: false,
                },
                bitcoincash: {
                  value: { ...bitcoinCashProvider },
                  configurable: false,
                  writable: false,
                },
                cosmos: {
                  value: { ...cosmosProvider },
                  configurable: false,
                  writable: false,
                },
                dash: {
                  value: { ...dashProvider },
                  configurable: false,
                  writable: false,
                },
                dogecoin: {
                  value: { ...dogecoinProvider },
                  configurable: false,
                  writable: false,
                },
                litecoin: {
                  value: { ...litecoinProvider },
                  configurable: false,
                  writable: false,
                },
                maya: {
                  value: { ...mayachainProvider },
                  configurable: false,
                  writable: false,
                },
                thorchain: {
                  value: { ...thorchainProvider },
                  configurable: false,
                  writable: false,
                },
                phantom: {
                  value: { ...phantomProvider },
                  configurable: false,
                  writable: false,
                },
              })
            },
            { once: true }
          )
        }
      } else {
        prioritize = false
      }
    })
    .catch(() => {})
}, 500)
