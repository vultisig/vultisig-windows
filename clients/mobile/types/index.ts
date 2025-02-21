export interface KeyShare {
  publicKey: string
  keyShare: string
}

export interface Coin {
  id: string
  chain: string
  address: string
  hexPublicKey: string
  ticker: string
  contractAddress: string
  isNativeToken: boolean
  logo: string
  priceProviderID: string
  decimals: number
}

export interface Vault {
  name: string
  publicKeyECDSA: string
  publicKeyEdDSA: string
  signers: string[]
  createdAt: string
  hexChainCode: string
  keyShares: KeyShare[]
  localPartyID: string
  resharePrefix: string
  order: number
  isBackedUp: boolean
  coins: Coin[]
  folderID?: string
  libType: string
}

export interface VaultFolder {
  id: string
  name: string
  order: number
}
