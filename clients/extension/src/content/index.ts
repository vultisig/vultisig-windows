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
        return await this.request({ method: x, params: y ?? [] })
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
    icon: 'data:image/png;base64,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',
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
            icon: 'data:image/png;base64,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',
            name: 'Vultisig',
            rdns: 'me.vultisig',
            uuid: uuidv4(),
          },
          provider: providerCopy as Provider.Ethereum as EIP1193Provider,
        })
        announceProvider({
          info: {
            icon: 'data:image/png;base64,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',
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
