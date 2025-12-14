export enum EventMethod {
  ACCOUNTS_CHANGED = 'accountsChanged',
  CHAIN_CHANGED = 'chainChanged',
  CONNECT = 'connect',
  DISCONNECT = 'diconnect',
  NETWORK_CHANGED = 'networkChanged',
}

export type EthereumProviderEvents = {
  [EventMethod.ACCOUNTS_CHANGED]: [accounts: string[]]
  [EventMethod.CHAIN_CHANGED]: [chainId: string]
  [EventMethod.CONNECT]: [connectInfo: { chainId: string }]
  [EventMethod.DISCONNECT]: [error: unknown[]]
  [EventMethod.NETWORK_CHANGED]: [networkId: number]
}
