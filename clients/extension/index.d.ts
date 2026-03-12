/// <reference types="vite/client" />

interface Window {
  bitcoin: any
  bitcoincash: any
  cosmos: any
  dash: any
  dogecoin: any
  ethereum: any
  litecoin: any
  lodash: unknown
  maya: any
  thorchain: any
  providers: EthereumProvider[]
  vultisig: any
  keplr: any
  vultiConnect: { getVaults: () => Promise<Vault[]> }
  phantom: any
  vultiConnectRouter: {
    ethereumProvider: EthereumProvider
    lastInjectedProvider?: EthereumProvider
    currentProvider: EthereumProvider
    providers: EthereumProvider[]
    setDefaultProvider: (vultiAsDefault: boolean) => void
    addProvider: (provider: EthereumProvider) => void
  }
  xfi: any
  ctrlKeplrProviders: any
  ctrlEthProviders: any
  isCtrl: boolean
  windowKeplr: any
  keplrRequestAccountsCallback: any
  tronWeb: any
  tronLink: any
  tonkeeper?: {
    tonconnect: {
      deviceInfo: unknown
      walletInfo?: unknown
      protocolVersion: number
      isWalletBrowser: boolean
      connect: (protocolVersion: number, message: unknown) => Promise<unknown>
      restoreConnection: () => Promise<unknown>
      send: (message: unknown) => Promise<unknown>
      listen: (callback: (event: unknown) => void) => () => void
      disconnect: () => Promise<void>
    }
  }
  injectedWeb3?: Record<
    string,
    {
      enable: (origin?: string) => Promise<{
        accounts: {
          get: () => Promise<
            {
              address: string
              genesisHash?: string
              name?: string
              type?: string
            }[]
          >
          subscribe: (
            cb: (
              accounts: {
                address: string
                genesisHash?: string
                name?: string
                type?: string
              }[]
            ) => void
          ) => () => void
        }
        signer: {
          signPayload: (
            payload: Record<string, unknown>
          ) => Promise<{ id: number; signature: string }>
          signRaw: (
            payload: Record<string, unknown>
          ) => Promise<{ id: number; signature: string }>
        }
      }>
    }
  >
}
