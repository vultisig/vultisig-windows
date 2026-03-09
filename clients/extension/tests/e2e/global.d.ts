/**
 * Type declarations for the Ethereum provider injected by VultiConnect.
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
  emit(event: string, ...args: any[]): void
}

declare global {
  interface Window {
    ethereum: EthereumProvider
  }
}

export {}
