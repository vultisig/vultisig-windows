import { callBackground } from '@core/inpage-provider/background'
import { ChainInfo } from '@keplr-wallet/types'
import { CosmosChain, OtherChain } from '@vultisig/core-chain/Chain'
import { getCosmosChainId } from '@vultisig/core-chain/chains/cosmos/chainInfo'
import { cosmosFeeCoinDenom } from '@vultisig/core-chain/chains/cosmos/cosmosFeeCoinDenom'
import { cosmosRpcUrl } from '@vultisig/core-chain/chains/cosmos/cosmosRpcUrl'
import { qbtcRestUrl } from '@vultisig/core-chain/chains/cosmos/qbtc/tendermintRpcUrl'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'

export type SupportedKeplrChain = (typeof supportedKeplrChains)[number]

// Terra Classic (columbus-5) deliberately omitted: it shares the `terra`
// bech32 prefix with Terra v2 (phoenix-1), and cosmos-kit / wallet-kit
// reject duplicate prefixes within a single chain set — including both
// makes dApps see Terra as "not in wallet". Terra Classic is still
// reachable through the Station provider's `switchNetwork('classic')`.
//
// QBTC is included here so Keplr-shaped dApps can connect via the
// standard `window.keplr` API in addition to the dedicated
// `window.vultisig.qbtc` provider. The signing path lies about `algo`
// (MLDSA-44 doesn't fit Keplr's `'secp256k1' | 'ed25519'` union) — see
// the QBTC branch in `getAccounts` inside `xdefiKeplr.ts`.
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
  OtherChain.QBTC,
] as const

/** QBTC chain ID. Mirrors the constant used throughout the SDK (QBTCHelper, ClaimRunner) so dApps that query the live block header see the same chain ID Vultisig signs for. */
const qbtcChainId = 'qbtc-testnet'

/**
 * QBTC isn't a `CosmosChain` in the SDK (it's `OtherChain.QBTC` because it
 * signs with MLDSA-44, not secp256k1), so `getCosmosChainId` doesn't know
 * about it. Centralize the chainId lookup so every site that resolves
 * Keplr-known chains stays consistent.
 */
const getKeplrChainId = (chain: SupportedKeplrChain): string =>
  chain === OtherChain.QBTC ? qbtcChainId : getCosmosChainId(chain)

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
  QBTC: 'qbtc',
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
  QBTC: 118,
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
  QBTC: 'QBTC Testnet',
}

// Average gas price; low/high are derived as ±50% so dApps that read all
// three slots get a sensible spread. THORChain / MayaChain use flat fees,
// so 0 is the canonical "ignore gas price" value. QBTC has a flat
// `min_tx_fee` of 800 uqbtc — pick a non-zero step so cosmos-kit fee
// calculators don't underpay.
export const keplrAverageGasPrice: Record<SupportedKeplrChain, number> = {
  Cosmos: 0.025,
  Osmosis: 0.025,
  Dydx: 12500000000,
  Kujira: 0.0034,
  Terra: 0.015,
  Noble: 0.025,
  Akash: 0.025,
  THORChain: 0,
  MayaChain: 0,
  QBTC: 0.004,
}

const buildBech32Config = (prefix: string) => ({
  bech32PrefixAccAddr: prefix,
  bech32PrefixAccPub: `${prefix}pub`,
  bech32PrefixValAddr: `${prefix}valoper`,
  bech32PrefixValPub: `${prefix}valoperpub`,
  bech32PrefixConsAddr: `${prefix}valcons`,
  bech32PrefixConsPub: `${prefix}valconspub`,
})

/** QBTC's fee denom matches the chain config (`base: 'qbtc'`). `cosmosFeeCoinDenom` is keyed by `CosmosChain` and doesn't include QBTC. */
const getKeplrFeeDenom = (chain: SupportedKeplrChain): string =>
  chain === OtherChain.QBTC ? 'qbtc' : cosmosFeeCoinDenom[chain]

const getKeplrRpcUrl = (chain: SupportedKeplrChain): string =>
  chain === OtherChain.QBTC ? qbtcRestUrl : cosmosRpcUrl[chain]

const buildKeplrChainInfo = (chain: SupportedKeplrChain): ChainInfo => {
  const prefix = bech32Prefix[chain]
  const denom = getKeplrFeeDenom(chain)
  const { ticker, decimals } = chainFeeCoin[chain]
  const average = keplrAverageGasPrice[chain]
  const rpc = getKeplrRpcUrl(chain)

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
    rpc,
    rest: rpc,
    chainId: getKeplrChainId(chain),
    chainName: chainName[chain],
    bip44: { coinType: bip44CoinType[chain] },
    bech32Config: buildBech32Config(prefix),
    currencies: [currency],
    feeCurrencies: [feeCurrency],
    stakeCurrency: currency,
    features: ['stargate', 'ibc-transfer'],
  }
}

const nativeChainIds = new Set(
  supportedKeplrChains.map(chain => getKeplrChainId(chain))
)

const chainByChainId = new Map<string, SupportedKeplrChain>(
  supportedKeplrChains.map(chain => [getKeplrChainId(chain), chain])
)

/**
 * Resolves a Keplr chain ID to one of Vultisig's supported chains. Combines
 * the SDK's `getCosmosChainByChainId` (which only knows {@link CosmosChain})
 * with QBTC, which is {@link OtherChain.QBTC} because it signs with MLDSA.
 */
export const getKeplrSupportedChainByChainId = (
  chainId: string
): SupportedKeplrChain | undefined => chainByChainId.get(chainId)

/** True if `chainId` is one of Vultisig's hardcoded Cosmos chains. */
export const isNativeKeplrChainId = (chainId: string): boolean =>
  nativeChainIds.has(chainId)

/**
 * Returns Keplr-shaped {@link ChainInfo} for every Cosmos chain Vultisig
 * natively signs for plus any persisted experimentally-suggested chains.
 * Used by `getChainInfosWithoutEndpoints` so dApps that probe the wallet's
 * chain list get a non-empty answer before
 * showing their connect modal — and so chains a dApp registered via
 * `experimentalSuggestChain` reappear after browser restart.
 */
export const getKeplrCosmosChainInfos = async (): Promise<ChainInfo[]> => {
  const suggested = await callBackground({ getKeplrSuggestedChains: {} })
  const native = supportedKeplrChains.map(buildKeplrChainInfo)
  const additions = Object.values(suggested).filter(
    info => !nativeChainIds.has(info.chainId)
  )
  return [...native, ...additions]
}
