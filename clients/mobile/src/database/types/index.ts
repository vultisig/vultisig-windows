export type KeyShare = {
  publicKey: string
  keyShare: string
}

export type Coin = {
  ID: string
  Chain: string
  Address: string
  HexPublicKey: string
  Ticker: string
  ContractAddress: string
  IsNativeToken: boolean
  Logo: string
  PriceProviderID: string
  Decimals: number
}

export type Vault = {
  Name: string
  PublicKeyECDSA: string
  PublicKeyEdDSA: string
  CreatedAt: string
  HexChainCode: string
  LocalPartyID: string
  Signers: string[]
  ResharePrefix: string
  Order: number
  IsBackedUp: boolean
  FolderID?: string
  LibType: string
  KeyShares: KeyShare[]
  Coins: Coin[]
}

export type VaultFolder = {
  ID: string
  Name: string
  Order: number
}

export type AddressBookItem = {
  ID: string
  Title: string
  Address: string
  Chain: string
  Order: number
}
