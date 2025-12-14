export type EthereumProviderEvents = {
  accountsChanged: [accounts: string[]]
  chainChanged: [chainId: string]
  connect: [connectInfo: { chainId: string }]
  disconnect: [error: unknown[]]
  networkChanged: [networkId: number]
}
