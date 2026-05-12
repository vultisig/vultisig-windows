import { ChainInfo } from '@keplr-wallet/types'
import { CosmosChain } from '@vultisig/core-chain/Chain'
import { getCosmosChainId } from '@vultisig/core-chain/chains/cosmos/chainInfo'
import { cosmosFeeCoinDenom } from '@vultisig/core-chain/chains/cosmos/cosmosFeeCoinDenom'
import { cosmosRpcUrl } from '@vultisig/core-chain/chains/cosmos/cosmosRpcUrl'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'

type SupportedKeplrChain = (typeof supportedKeplrChains)[number]

// Terra Classic (columbus-5) deliberately omitted: it shares the `terra`
// bech32 prefix with Terra v2 (phoenix-1), and cosmos-kit / wallet-kit
// reject duplicate prefixes within a single chain set — including both
// makes dApps see Terra as "not in wallet" (Skeletonswap renders the
// red dot + "must add it to your wallet" hint). Terra Classic is still
// reachable through the Station provider's `switchNetwork('classic')`.
const supportedKeplrChains = [
  CosmosChain.Cosmos,
  CosmosChain.Osmosis,
  CosmosChain.Dydx,
  CosmosChain.Kujira,
  CosmosChain.Terra,
  CosmosChain.Noble,
  CosmosChain.Akash,
  CosmosChain.THORChain,
  CosmosChain.MayaChain,
] as const

const bech32Prefix: Record<SupportedKeplrChain, string> = {
  Cosmos: 'cosmos',
  Osmosis: 'osmo',
  Dydx: 'dydx',
  Kujira: 'kujira',
  Terra: 'terra',
  Noble: 'noble',
  Akash: 'akash',
  THORChain: 'thor',
  MayaChain: 'maya',
}

const bip44CoinType: Record<SupportedKeplrChain, number> = {
  Cosmos: 118,
  Osmosis: 118,
  Dydx: 118,
  Kujira: 118,
  Noble: 118,
  Akash: 118,
  Terra: 330,
  THORChain: 931,
  MayaChain: 931,
}

const chainName: Record<SupportedKeplrChain, string> = {
  Cosmos: 'Cosmos Hub',
  Osmosis: 'Osmosis',
  Dydx: 'dYdX',
  Kujira: 'Kujira',
  Terra: 'Terra',
  Noble: 'Noble',
  Akash: 'Akash',
  THORChain: 'THORChain',
  MayaChain: 'MayaChain',
}

// Average gas price; low/high are derived as ±50% so dApps that read all
// three slots get a sensible spread. THORChain / MayaChain use flat fees,
// so 0 is the canonical "ignore gas price" value.
const averageGasPrice: Record<SupportedKeplrChain, number> = {
  Cosmos: 0.025,
  Osmosis: 0.025,
  Dydx: 12500000000,
  Kujira: 0.0034,
  Terra: 0.015,
  Noble: 0.025,
  Akash: 0.025,
  THORChain: 0,
  MayaChain: 0,
}

const buildBech32Config = (prefix: string) => ({
  bech32PrefixAccAddr: prefix,
  bech32PrefixAccPub: `${prefix}pub`,
  bech32PrefixValAddr: `${prefix}valoper`,
  bech32PrefixValPub: `${prefix}valoperpub`,
  bech32PrefixConsAddr: `${prefix}valcons`,
  bech32PrefixConsPub: `${prefix}valconspub`,
})

const buildKeplrChainInfo = (chain: SupportedKeplrChain): ChainInfo => {
  const prefix = bech32Prefix[chain]
  const denom = cosmosFeeCoinDenom[chain]
  const { ticker, decimals } = chainFeeCoin[chain]
  const average = averageGasPrice[chain]

  const currency = {
    coinDenom: ticker,
    coinMinimalDenom: denom,
    coinDecimals: decimals,
  }

  const feeCurrency = {
    ...currency,
    gasPriceStep: {
      low: average * 0.5,
      average,
      high: average * 1.5,
    },
  }

  return {
    rpc: cosmosRpcUrl[chain],
    rest: cosmosRpcUrl[chain],
    chainId: getCosmosChainId(chain),
    chainName: chainName[chain],
    bip44: { coinType: bip44CoinType[chain] },
    bech32Config: buildBech32Config(prefix),
    currencies: [currency],
    feeCurrencies: [feeCurrency],
    stakeCurrency: currency,
    features: ['stargate', 'ibc-transfer'],
  }
}

/**
 * Returns Keplr-shaped {@link ChainInfo} for every Cosmos chain Vultisig
 * natively signs for. Used by `getChainInfosWithoutEndpoints` so dApps that
 * probe the wallet's chain list (Skeletonswap and other cosmos-kit dApps)
 * get a non-empty answer before they show their connect modal.
 */
export const getKeplrCosmosChainInfos = (): ChainInfo[] =>
  supportedKeplrChains.map(buildKeplrChainInfo)
