import type { ToolHandler } from '../types'

export const handleGetCoins: ToolHandler = async (input, context) => {
  let coins = context.coins
  const chainFilter = input.chain ? String(input.chain).trim() : ''

  if (chainFilter) {
    const lower = chainFilter.toLowerCase()
    coins = coins.filter(c => c.chain.toLowerCase() === lower)
  }

  const result = coins.map(c => ({
    chain: c.chain,
    ticker: c.ticker,
    address: c.address,
    contract_address: c.contractAddress ?? '',
    is_native: c.isNativeToken,
    decimals: c.decimals,
    logo: c.logo ?? '',
    price_provider_id: c.priceProviderId ?? '',
  }))

  return {
    data: {
      coins: result,
      total_count: result.length,
      ...(chainFilter ? { chain_filter: chainFilter } : {}),
    },
  }
}
