/**
 * Type declarations for the providers injected by VultiConnect.
 * Used in Playwright evaluate() calls.
 */
interface EthereumProvider {
  isMetaMask: boolean
  isVultiConnect: boolean
  isXDEFI: boolean
  isCtrl: boolean
  chainId: string
  connected: boolean
  networkVersion: string
  selectedAddress: string
  isConnected(): boolean
  request(args: { method: string; params?: unknown[] }): Promise<unknown>
  enable(): Promise<string[]>
  on(event: string, listener: (...args: any[]) => void): void
  removeListener(event: string, listener: (...args: any[]) => void): void
  removeAllListeners(event?: string): void
  emit(event: string, ...args: any[]): void
  sendAsync: EthereumProvider['request']
}

interface SolanaProvider {
  isPhantom: boolean
  isXDEFI: boolean
  isConnected: boolean
  publicKey: unknown | null
  connect(): Promise<{ publicKey: unknown }>
  disconnect(): Promise<void>
  signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>
  signTransaction(tx: unknown): Promise<unknown>
  signAndSendTransaction(
    tx: unknown,
    options?: unknown
  ): Promise<{ signature: string }>
  signIn(input?: unknown): Promise<unknown>
  on(event: string, listener: (...args: any[]) => void): () => void
  request(args: { method: string; params?: unknown[] }): Promise<unknown>
}

interface UTXOProvider {
  chain: string
  requestAccounts(): Promise<unknown[]>
  request(args: { method: string; params?: unknown[] }): Promise<unknown>
  on(event: string, listener: (...args: any[]) => void): void
}

interface CosmosProvider {
  chainId: string
  isVultiConnect: boolean
  request(
    args: { method: string; params?: unknown[] },
    callback?: unknown
  ): Promise<unknown>
}

interface KeplrProvider {
  isXDEFI: boolean
  isVulticonnect: boolean
  enable(chainIds: string | string[]): Promise<void>
  getKey(chainId: string): Promise<unknown>
  getOfflineSigner(chainId: string): unknown
  getOfflineSignerOnlyAmino(chainId: string): unknown
  signAmino(
    chainId: string,
    signer: string,
    signDoc: unknown
  ): Promise<unknown>
  signDirect(
    chainId: string,
    signer: string,
    signDoc: unknown,
    signOptions: unknown
  ): Promise<unknown>
  experimentalSuggestChain(chainInfo: unknown): Promise<void>
}

interface TronLinkProvider {
  isVultiConnect: boolean
  isTronLink: boolean
  tronWeb: unknown
  ready: boolean
  request(args: { method: string; params?: unknown[] }): Promise<unknown>
}

interface PolkadotInjected {
  enable(origin?: string): Promise<{
    accounts: {
      get(): Promise<unknown[]>
      subscribe(cb: (accounts: unknown[]) => void): () => void
    }
    signer: {
      signPayload(payload: unknown): Promise<unknown>
      signRaw(payload: unknown): Promise<unknown>
    }
  }>
}

interface VultiConnectRouter {
  ethereumProvider: EthereumProvider
  lastInjectedProvider: EthereumProvider | undefined
  currentProvider: EthereumProvider
  providers: EthereumProvider[]
  setDefaultProvider(vultiAsDefault: boolean): void
  addProvider(provider: EthereumProvider): void
}

interface VultisigProvider {
  bitcoin: UTXOProvider
  bitcoincash: UTXOProvider
  dogecoin: UTXOProvider
  litecoin: UTXOProvider
  zcash: UTXOProvider
  cosmos: CosmosProvider
  dash: { chainId: string; request: Function }
  ethereum: EthereumProvider
  keplr: KeplrProvider
  mayachain: CosmosProvider
  polkadot: PolkadotInjected
  ripple: { request: Function }
  solana: SolanaProvider
  sui: { request: Function }
  thorchain: CosmosProvider
  tron: TronLinkProvider
  cardano: { request: Function }
  plugin: unknown
  getVault(): Promise<unknown>
  getVaults(): Promise<unknown>
}

declare global {
  interface Window {
    ethereum: EthereumProvider
    vultisig: VultisigProvider
    phantom: {
      bitcoin: UTXOProvider
      ethereum: EthereumProvider
      solana: SolanaProvider
    }
    keplr: KeplrProvider
    tronLink: TronLinkProvider
    tronWeb: unknown
    xfi: VultisigProvider
    injectedWeb3: {
      vultisig: PolkadotInjected
      'polkadot-js': PolkadotInjected & { version: string }
      [key: string]: unknown
    }
    vultiConnectRouter: VultiConnectRouter
    isCtrl: boolean
    ctrlEthProviders: Record<string, EthereumProvider>
    ctrlKeplrProviders: Record<string, KeplrProvider>
  }
}

export {}
