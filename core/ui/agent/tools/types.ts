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

type ToolContext = {
  vaultPubKey: string
  vaultName: string
  authToken?: string
  coins: CoinInfo[]
}

type ToolHandlerResult = {
  data: Record<string, unknown>
  vaultModified?: boolean
}

type ToolHandler = (
  input: Record<string, unknown>,
  context: ToolContext
) => Promise<ToolHandlerResult>

export type { CoinInfo, ToolContext, ToolHandler, ToolHandlerResult }
