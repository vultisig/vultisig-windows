import { getEthChainId } from './eth_chainId'

type WalletCapabilities = Record<string, Record<string, unknown>>

export const getWalletCapabilities = async (): Promise<WalletCapabilities> => {
  const chainId = await getEthChainId()
  return {
    [chainId]: {},
  }
}
