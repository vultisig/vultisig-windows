import { Chain, CosmosChain } from '@vultisig/core-chain/Chain'

export const getCosmosChainFromAddress = (address: string): string | null => {
  const prefixToChain: Record<string, CosmosChain> = {
    cosmos: Chain.Cosmos,
    osmo: Chain.Osmosis,
    terra: Chain.Terra,
    akash: Chain.Akash,
    kujira: Chain.Kujira,
    noble: Chain.Noble,
    // @ts-expect-error — SDK gap: QBTC chain not in SDK Chain/CosmosChain union
    qbtc: 'QBTC',
  }

  const match = address.match(/^([a-z0-9]+?)1/)
  if (!match) return null

  const prefix = match[1]
  return prefixToChain[prefix] || null
}
