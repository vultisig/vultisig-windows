type CoinInfo = {
  chain: string
  ticker: string
  address: string
  contractAddress?: string
  decimals: number
  logo?: string
  priceProviderId?: string
  isNativeToken: boolean
}

type KeyShareInfo = {
  publicKey: string
  keyShare: string
}

type VaultMeta = {
  password: string
  localPartyId: string
  publicKeyEcdsa: string
  publicKeyEddsa: string
  hexChainCode: string
  resharePrefix: string
  libType: string
  signers: string[]
  keyShares: KeyShareInfo[]
}

type ToolContext = {
  vaultPubKey: string
  vaultName: string
  authToken?: string
  coins: CoinInfo[]
  vault?: VaultMeta
  conversationId?: string
  emitEvent?: (event: string, data: Record<string, unknown>) => void
}

type ToolHandlerResult = {
  data: Record<string, unknown>
  vaultModified?: boolean
}

type ToolHandler = (
  input: Record<string, unknown>,
  context: ToolContext
) => Promise<ToolHandlerResult>

export type { CoinInfo, ToolContext, ToolHandler, ToolHandlerResult, VaultMeta }
