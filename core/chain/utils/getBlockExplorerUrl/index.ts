import { Chain } from '@core/chain/Chain'
import { match } from '@lib/utils/match'

type ChainEntity = 'address' | 'tx'

type GetBlockExplorerUrlInput = {
  chain: Chain
  entity: ChainEntity
  value: string
}

const cosmosBlockExplorer = 'https://www.mintscan.io'

const blockExplorerBaseUrl: Record<Chain, string> = {
  [Chain.Bitcoin]: 'https://mempool.space',
  [Chain.BitcoinCash]: 'https://blockchair.com/bitcoin-cash',
  [Chain.Litecoin]: 'https://blockchair.com/litecoin',
  [Chain.Dogecoin]: 'https://blockchair.com/dogecoin',
  [Chain.Dash]: 'https://blockchair.com/dash',
  [Chain.Solana]: 'https://solscan.io',
  [Chain.Ethereum]: 'https://etherscan.io',
  [Chain.Cosmos]: `${cosmosBlockExplorer}/cosmos`,
  [Chain.Dydx]: `${cosmosBlockExplorer}/dydx`,
  [Chain.Kujira]: 'https://finder.kujira.network/kaiyo-1',
  [Chain.Avalanche]: 'https://snowtrace.io',
  [Chain.BSC]: 'https://bscscan.com',
  [Chain.Arbitrum]: 'https://arbiscan.io',
  [Chain.Base]: 'https://basescan.org',
  [Chain.Optimism]: 'https://optimistic.etherscan.io',
  [Chain.Polygon]: 'https://polygonscan.com',
  [Chain.Blast]: 'https://blastscan.io',
  [Chain.CronosChain]: 'https://cronoscan.com',
  [Chain.Sui]: 'https://suiscan.xyz/mainnet',
  [Chain.Polkadot]: 'https://polkadot.subscan.io',
  [Chain.Zksync]: 'https://explorer.zksync.io',
  [Chain.Ton]: 'https://tonviewer.com',
  [Chain.Osmosis]: `${cosmosBlockExplorer}/osmosis`,
  [Chain.Terra]: `${cosmosBlockExplorer}/terra`,
  [Chain.TerraClassic]: 'https://finder.terra.money/classic',
  [Chain.Noble]: `${cosmosBlockExplorer}/noble`,
  [Chain.Ripple]: 'https://xrpscan.com',
  [Chain.THORChain]: 'https://www.xscanner.org',
  [Chain.MayaChain]: 'https://www.xscanner.org',
  [Chain.Akash]: `${cosmosBlockExplorer}/akash`,
  [Chain.Tron]: 'https://tronscan.org/#',
}

export const getBlockExplorerUrl = ({
  chain,
  entity,
  value,
}: GetBlockExplorerUrlInput): string => {
  const baseUrl = blockExplorerBaseUrl[chain]
  return match(entity, {
    address: () =>
      match(chain, {
        [Chain.Bitcoin]: () => `${baseUrl}/address/${value}`,
        [Chain.BitcoinCash]: () => `${baseUrl}/address/${value}`,
        [Chain.Litecoin]: () => `${baseUrl}/address/${value}`,
        [Chain.Dogecoin]: () => `${baseUrl}/address/${value}`,
        [Chain.Dash]: () => `${baseUrl}/address/${value}`,
        [Chain.THORChain]: () => `${baseUrl}/address/${value}`,
        [Chain.Solana]: () => `${baseUrl}/address/${value}`,
        [Chain.Ethereum]: () => `${baseUrl}/address/${value}`,
        [Chain.Cosmos]: () => `${baseUrl}/address/${value}`,
        [Chain.Dydx]: () => `${baseUrl}/address/${value}`,
        [Chain.Kujira]: () => `${baseUrl}/address/${value}`,
        [Chain.Avalanche]: () => `${baseUrl}/address/${value}`,
        [Chain.BSC]: () => `${baseUrl}/address/${value}`,
        [Chain.MayaChain]: () => `${baseUrl}/address/${value}`,
        [Chain.Arbitrum]: () => `${baseUrl}/address/${value}`,
        [Chain.Base]: () => `${baseUrl}/address/${value}`,
        [Chain.Optimism]: () => `${baseUrl}/address/${value}`,
        [Chain.Polygon]: () => `${baseUrl}/address/${value}`,
        [Chain.Blast]: () => `${baseUrl}/address/${value}`,
        [Chain.CronosChain]: () => `${baseUrl}/address/${value}`,
        [Chain.Sui]: () => `${baseUrl}/address/${value}`,
        [Chain.Polkadot]: () => `${baseUrl}/account/${value}`,
        [Chain.Zksync]: () => `${baseUrl}/address/${value}`,
        [Chain.Ton]: () => `${baseUrl}/${value}`,
        [Chain.Osmosis]: () => `${baseUrl}/address/${value}`,
        [Chain.Terra]: () => `${baseUrl}/address/${value}`,
        [Chain.TerraClassic]: () => `${baseUrl}/classic/address/${value}`,
        [Chain.Noble]: () => `${baseUrl}/address/${value}`,
        [Chain.Ripple]: () => `${baseUrl}/account/${value}`,
        [Chain.Akash]: () => `${baseUrl}/address/${value}`,
        [Chain.Tron]: () => `${baseUrl}/address/${value}`,
      }),
    tx: () =>
      match(chain, {
        [Chain.Bitcoin]: () => `${baseUrl}/tx/${value}`,
        [Chain.BitcoinCash]: () => `${baseUrl}/transaction/${value}`,
        [Chain.Litecoin]: () => `${baseUrl}/transaction/${value}`,
        [Chain.Dogecoin]: () => `${baseUrl}/transaction/${value}`,
        [Chain.Dash]: () => `${baseUrl}/transaction/${value}`,
        [Chain.THORChain]: () => `${baseUrl}/tx/${value}`,
        [Chain.Solana]: () => `${baseUrl}/tx/${value}`,
        [Chain.Ethereum]: () => `${baseUrl}/tx/${value}`,
        [Chain.Cosmos]: () => `${baseUrl}/tx/${value}`,
        [Chain.Dydx]: () => `${baseUrl}/tx/${value}`,
        [Chain.Kujira]: () => `${baseUrl}/tx/${value}`,
        [Chain.Avalanche]: () => `${baseUrl}/tx/${value}`,
        [Chain.BSC]: () => `${baseUrl}/tx/${value}`,
        [Chain.MayaChain]: () => `${baseUrl}/tx/${value}`,
        [Chain.Arbitrum]: () => `${baseUrl}/tx/${value}`,
        [Chain.Base]: () => `${baseUrl}/tx/${value}`,
        [Chain.Optimism]: () => `${baseUrl}/tx/${value}`,
        [Chain.Polygon]: () => `${baseUrl}/tx/${value}`,
        [Chain.Blast]: () => `${baseUrl}/tx/${value}`,
        [Chain.CronosChain]: () => `${baseUrl}/tx/${value}`,
        [Chain.Sui]: () => `${baseUrl}/tx/${value}`,
        [Chain.Polkadot]: () => `${baseUrl}/extrinsic/${value}`,
        [Chain.Zksync]: () => `${baseUrl}/tx/${value}`,
        [Chain.Ton]: () => `${baseUrl}/transaction/${value}`,
        [Chain.Osmosis]: () => `${baseUrl}/tx/${value}`,
        [Chain.Terra]: () => `${baseUrl}/tx/${value}`,
        [Chain.TerraClassic]: () => `${baseUrl}/tx/${value}`,
        [Chain.Noble]: () => `${baseUrl}/tx/${value}`,
        [Chain.Ripple]: () => `${baseUrl}/transaction/${value}`,
        [Chain.Akash]: () => `${baseUrl}/tx/${value}`,
        [Chain.Tron]: () => `${baseUrl}/transaction/${value}`,
      }),
  })
}
