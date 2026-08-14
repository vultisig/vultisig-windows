import { cosmosRpcUrl } from '@vultisig/core-chain/chains/cosmos/cosmosRpcUrl'
import { getCoinPrices } from '@vultisig/core-chain/coin/price/getCoinPrices'
import { FiatCurrency } from '@vultisig/core-config/FiatCurrency'
import { isEmpty } from '@vultisig/lib-utils/array/isEmpty'
import { queryUrl } from '@vultisig/lib-utils/query/queryUrl'

// THORChain reports pool prices in TOR, a USD-pegged unit scaled by 10^8.
const torPriceDecimals = 8

// USD stablecoin anchor: its price in a given fiat currency is the USD -> fiat
// rate used to convert USD-denominated pool prices.
const usdAnchorPriceProviderId = 'usd-coin'
const usdFiatCurrency: FiatCurrency = 'usd'

type ThorchainPool = {
  asset: string
  asset_tor_price?: string
}

/**
 * THORChain secured-asset bank denoms are lowercase and hyphen-separated
 * (`btc-btc`, `gaia-atom`, `eth-usdc-0x…`). Native-token denoms instead use
 * `x/…`, `factory/…`, `ibc/…`, or a dotted form (`thor.lqdy`) and are not
 * pooled, so we exclude them here.
 */
export const isThorchainSecuredAssetDenom = (denom: string): boolean =>
  !denom.includes('/') && !denom.includes('.') && denom.includes('-')

/**
 * Maps a secured-asset bank denom to its THORChain pool id: uppercase the
 * denom and turn the leading chain segment's hyphen into a dot
 * (`eth-usdc-0x…` → `ETH.USDC-0X…`, `btc-btc` → `BTC.BTC`).
 */
export const securedAssetDenomToPoolAsset = (denom: string): string =>
  denom.toUpperCase().replace('-', '.')

/**
 * Prices THORChain secured assets from THORChain's own pool oracle
 * (`asset_tor_price`). Returns USD prices keyed by the input denom; denoms
 * without an available pool price are omitted (and logged, so a data-source
 * gap is diagnosable from the console).
 *
 * A failed pools request throws instead of resolving empty: price queries
 * cache successes with refetching disabled, so a swallowed failure would pin
 * every secured asset at 0 until the cache expires.
 */
export const getThorchainSecuredAssetPrices = async (
  denoms: string[]
): Promise<Record<string, number>> => {
  const pools = await queryUrl<ThorchainPool[]>(
    `${cosmosRpcUrl.THORChain}/thorchain/pools`
  )

  const priceByPoolAsset: Record<string, number> = {}
  for (const pool of pools) {
    const torPrice = Number(pool.asset_tor_price)
    if (Number.isFinite(torPrice) && torPrice > 0) {
      priceByPoolAsset[pool.asset] = torPrice / 10 ** torPriceDecimals
    }
  }

  const prices: Record<string, number> = {}
  const unpricedDenoms: string[] = []
  for (const denom of denoms) {
    const price = priceByPoolAsset[securedAssetDenomToPoolAsset(denom)]
    if (price != null) {
      prices[denom] = price
    } else {
      unpricedDenoms.push(denom)
    }
  }

  if (!isEmpty(unpricedDenoms)) {
    console.error(
      `No THORChain pool price for secured asset denoms: ${unpricedDenoms.join(', ')}`
    )
  }

  return prices
}

type GetThorchainSecuredAssetFiatPricesInput = {
  denoms: string[]
  fiatCurrency: FiatCurrency
}

/**
 * THORChain pool prices are USD-denominated (`asset_tor_price`). Converts them
 * to `fiatCurrency` using a USD stablecoin anchor (its price in that currency
 * is the USD -> fiat rate). Returns prices keyed by denom.
 *
 * When the anchor quote is unavailable for a non-USD currency, throws rather
 * than mislabeling raw USD values as the selected fiat or caching an empty
 * success — the query layer retries and refetches on the next mount.
 */
export const getThorchainSecuredAssetFiatPrices = async ({
  denoms,
  fiatCurrency,
}: GetThorchainSecuredAssetFiatPricesInput): Promise<
  Record<string, number>
> => {
  let usdToFiatRate = 1
  if (fiatCurrency !== usdFiatCurrency) {
    const anchorPrices = await getCoinPrices({
      ids: [usdAnchorPriceProviderId],
      fiatCurrency,
    })
    const anchorRate = anchorPrices[usdAnchorPriceProviderId]
    if (anchorRate == null) {
      throw new Error(
        `Missing ${usdAnchorPriceProviderId} anchor price for ${fiatCurrency}: cannot convert THORChain pool prices`
      )
    }
    usdToFiatRate = anchorRate
  }

  const usdPrices = await getThorchainSecuredAssetPrices(denoms)

  const prices: Record<string, number> = {}
  for (const [denom, usdPrice] of Object.entries(usdPrices)) {
    prices[denom] = usdPrice * usdToFiatRate
  }

  return prices
}
