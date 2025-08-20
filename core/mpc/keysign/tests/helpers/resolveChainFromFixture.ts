import { Chain } from '@core/chain/Chain'

const aliases: Record<string, Chain> = {
  // EVM f
  ethereum: Chain.Ethereum,
  arbitrum: Chain.Arbitrum,
  optimism: Chain.Optimism,
  polygon: Chain.Polygon,
  base: Chain.Base,
  avalanche: Chain.Avalanche,
  bsc: Chain.BSC,
  binancesmartchain: Chain.BSC,
  smartchain: Chain.BSC,

  // UTXO
  bitcoin: Chain.Bitcoin,
  'bitcoin-cash': Chain.BitcoinCash,
  dogecoin: Chain.Dogecoin,
  litecoin: Chain.Litecoin,
  zcash: Chain.Zcash,

  // Cosmos
  cosmos: Chain.Cosmos,
  gaia: Chain.Cosmos,
  gaiachain: Chain.Cosmos,
  kujira: Chain.Kujira,
  thorchain: Chain.THORChain,
  mayachain: Chain.MayaChain,
  terra: Chain.Terra,
  terraclassic: Chain.TerraClassic,

  solana: Chain.Solana,
  ripple: Chain.Ripple,
  ton: Chain.Ton,
  tron: Chain.Tron,
  polkadot: Chain.Polkadot,
  cardano: Chain.Cardano,
  sui: Chain.Sui,
}

export const resolveChainFromFixture = (s: string): Chain => {
  const key = (s ?? '').toLowerCase().trim()
  const chain = aliases[key]
  if (!chain) throw new Error(`Unknown chain in fixtures: "${s}"`)
  return chain
}
