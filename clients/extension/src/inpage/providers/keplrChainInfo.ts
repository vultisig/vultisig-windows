import { callBackground } from '@core/inpage-provider/background'
import { ChainInfo } from '@keplr-wallet/types'
import { CosmosChain, OtherChain } from '@vultisig/core-chain/Chain'
import { getCosmosChainId } from '@vultisig/core-chain/chains/cosmos/chainInfo'
import { cosmosFeeCoinDenom } from '@vultisig/core-chain/chains/cosmos/cosmosFeeCoinDenom'
import { cosmosRpcUrl } from '@vultisig/core-chain/chains/cosmos/cosmosRpcUrl'
import { qbtcRestUrl } from '@vultisig/core-chain/chains/cosmos/qbtc/tendermintRpcUrl'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'

export type SupportedKeplrChain = (typeof supportedKeplrChains)[number]

// Terra Classic (columbus-5) is resolvable and signable by chainID, but is
// kept out of the *advertised* chain list (see `advertisedKeplrChains`): it
// shares the `terra` bech32 prefix with Terra v2 (phoenix-1), and some
// cosmos-kit / wallet-kit dApps build a prefix→chain map from the enumerated
// `getChainInfosWithoutEndpoints()` list, where a duplicate `terra` prefix
// makes them resolve Terra to the wrong chain and show it as "not in wallet".
// Terra Classic dApps connect through their own Station extension
// connector, which probes `window.station.keplr.getKey('columbus-5')`
// — a chainID-keyed call routed here that is unaffected by enumeration, so it
// must resolve. (Terra Classic also remains reachable through the Station
// provider's `switchNetwork('classic')`.)
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
  CosmosChain.TerraClassic,
  CosmosChain.Noble,
  CosmosChain.Akash,
  CosmosChain.THORChain,
  CosmosChain.MayaChain,
  OtherChain.QBTC,
] as const

// Chains advertised in the enumerated `getChainInfosWithoutEndpoints()`
// response. Excludes Terra Classic so dApps that register chains by bech32
// prefix don't collide Terra v2 (`phoenix-1`) and Terra Classic
// (`columbus-5`), which share the `terra` prefix. Per-chainID lookups
// (`getKey`, `enable`, signing) still resolve Terra Classic via
// `supportedKeplrChains`.
const advertisedKeplrChains = supportedKeplrChains.filter(
  chain => chain !== CosmosChain.TerraClassic
)

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
  TerraClassic: 'terra',
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
  TerraClassic: 330,
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
  TerraClassic: 'Terra Classic',
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
//
// Osmosis runs an EIP-1559-style base-fee market where the network min has
// floated above the historical 0.025 average. Use 0.04 (Keplr's chain-registry
// "high" tier) so wallet-injected fees clear the current floor without an
// extra RPC round-trip per signDirect.
export const keplrAverageGasPrice: Record<SupportedKeplrChain, number> = {
  Cosmos: 0.025,
  Osmosis: 0.04,
  Dydx: 12500000000,
  Kujira: 0.0034,
  Terra: 0.015,
  // Terra Classic's on-chain minimum gas price for uluna is far higher than
  // Terra v2's; mirror the Station provider's `classic` gas price so injected
  // fees clear the network floor.
  TerraClassic: 28.325,
  Noble: 0.025,
  Akash: 0.025,
  THORChain: 0,
  MayaChain: 0,
  QBTC: 0.004,
}

// Lower bound (in the chain's fee denom base units) for a wallet-injected
// fee. `gasLimit * gasPrice` can land below what the chain's validators
// actually accept — Akash's chain-registry gas price (0.025 uakt/gas)
// yields only 7500 uakt (0.0075 AKT) on a ~300k-gas delegation, which the
// network's mempool rejects. Floor the injected amount to the minimum the
// chain expects. Only chains that need a floor above their computed fee are
// listed; everything else relies on `gasLimit * gasPrice` alone.
export const keplrMinInjectedFee: Partial<Record<SupportedKeplrChain, bigint>> =
  {
    // 0.025 AKT — the minimum fee Akash validators accept for staking txs.
    Akash: 25_000n,
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
  const native = advertisedKeplrChains.map(buildKeplrChainInfo)
  const additions = Object.values(suggested).filter(
    info => !nativeChainIds.has(info.chainId)
  )
  return [...native, ...additions]
}
