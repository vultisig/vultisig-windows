export type EthereumProviderEvents = {
  accountsChanged: [accounts: string[]]
  chainChanged: [chainId: string]
  connect: [connectInfo: { chainId: string }]
  diconnect: [error: unknown[]]
  networkChanged: [networkId: number]
}
