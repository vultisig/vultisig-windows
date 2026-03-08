import { Chain } from './Chain'

export type DerivationGroup = {
  groupId: string
  chains: Chain[]
}

const knownPathGroupIds: Record<string, string> = {
  "m/44'/60'/0'/0/0": 'ETH',
  "m/44'/118'/0'/0/0": 'ATOM',
  "m/44'/931'/0'/0/0": 'RUNE',
  "m/44'/330'/0'/0/0": 'LUNA',
}

export function groupChainsByDerivationPath(
  chains: Chain[]
): DerivationGroup[] {
  const pathToChains = new Map<string, Chain[]>()
  for (const chain of chains) {
    const path = chainDerivationPath[chain]
    const group = pathToChains.get(path) || []
    group.push(chain)
    pathToChains.set(path, group)
  }

  return Array.from(pathToChains.entries()).map(([path, groupChains]) => ({
    groupId:
      groupChains.length === 1
        ? groupChains[0]
        : (knownPathGroupIds[path] ?? groupChains[0]),
    chains: groupChains,
  }))
}

export const chainDerivationPath: Record<Chain, string> = {
  [Chain.Bitcoin]: "m/84'/0'/0'/0/0",
  [Chain.Litecoin]: "m/84'/2'/0'/0/0",
  [Chain.BitcoinCash]: "m/44'/145'/0'/0/0",
  [Chain.Dogecoin]: "m/44'/3'/0'/0/0",
  [Chain.Dash]: "m/44'/5'/0'/0/0",
  [Chain.Zcash]: "m/44'/133'/0'/0/0",

  [Chain.Ethereum]: "m/44'/60'/0'/0/0",
  [Chain.Arbitrum]: "m/44'/60'/0'/0/0",
  [Chain.Avalanche]: "m/44'/60'/0'/0/0",
  [Chain.Base]: "m/44'/60'/0'/0/0",
  [Chain.Blast]: "m/44'/60'/0'/0/0",
  [Chain.BSC]: "m/44'/60'/0'/0/0",
  [Chain.CronosChain]: "m/44'/60'/0'/0/0",
  [Chain.Optimism]: "m/44'/60'/0'/0/0",
  [Chain.Polygon]: "m/44'/60'/0'/0/0",
  [Chain.Zksync]: "m/44'/60'/0'/0/0",
  [Chain.Mantle]: "m/44'/60'/0'/0/0",
  [Chain.Hyperliquid]: "m/44'/60'/0'/0/0",
  [Chain.Sei]: "m/44'/60'/0'/0/0",

  [Chain.THORChain]: "m/44'/931'/0'/0/0",
  [Chain.MayaChain]: "m/44'/931'/0'/0/0",
  [Chain.Cosmos]: "m/44'/118'/0'/0/0",
  [Chain.Osmosis]: "m/44'/118'/0'/0/0",
  [Chain.Kujira]: "m/44'/118'/0'/0/0",
  [Chain.Dydx]: "m/44'/118'/0'/0/0",
  [Chain.Terra]: "m/44'/330'/0'/0/0",
  [Chain.TerraClassic]: "m/44'/330'/0'/0/0",
  [Chain.Noble]: "m/44'/118'/0'/0/0",
  [Chain.Akash]: "m/44'/118'/0'/0/0",

  [Chain.Solana]: "m/44'/501'/0'/0'",
  [Chain.Polkadot]: "m/44'/354'/0'/0/0",
  [Chain.Sui]: "m/44'/784'/0'/0/0",
  [Chain.Ton]: "m/44'/607'/0'/0/0",
  [Chain.Ripple]: "m/44'/144'/0'/0/0",
  [Chain.Tron]: "m/44'/195'/0'/0/0",
  [Chain.Cardano]: "m/1852'/1815'/0'/0/0",
  [Chain.ZcashShielded]: "m/32'/133'/0'",
  [Chain.Monero]: "m/44'/128'/0'/0/0",
}
