import { IbcEnabledCosmosChain } from '@vultisig/core-chain/Chain'
import { cosmosRpcUrl } from '@vultisig/core-chain/chains/cosmos/cosmosRpcUrl'

/**
 * Chain-level inputs needed to estimate staking APY on a Cosmos SDK chain.
 *
 * Per-validator APY is derived from these as:
 *   apy = (1 - communityTax) × (inflation / bondedRatio) × (1 - commission)
 *
 * The first three terms are chain-wide and cached per chain; commission is
 * per-validator and applied at the call site.
 *
 * The formula captures *inflation*-based rewards only. Chains whose
 * staking yield comes primarily from tx-fee redistribution (e.g.
 * TerraClassic, where inflation was set to 0 by governance) will compute
 * to ~0% here — accurate for the inflation portion, but understating
 * total yield. We accept that for now; modelling tx-fee yield requires a
 * lookback window over distribution events.
 */
export type CosmosChainApyData = {
  /** Current annual inflation as a decimal, e.g. 0.07 for 7%. */
  inflation: number
  /** `bonded_tokens / total_supply` for the staking denom, in [0, 1]. */
  bondedRatio: number
  /** Community pool tax as a decimal, e.g. 0.02 for 2%. */
  communityTax: number
}

type FetchOpts = { fetchImpl?: typeof fetch; signal?: AbortSignal }

const lcdGet = async <T>(url: string, opts: FetchOpts): Promise<T | null> => {
  const f = opts.fetchImpl ?? fetch
  const res = await f(url, { signal: opts.signal })
  // 404 / 501 typically mean the module isn't enabled on this chain.
  // Return null so the caller can substitute a zero value instead of
  // throwing the whole APY query.
  if (res.status === 404 || res.status === 501) return null
  if (!res.ok) throw new Error(`LCD ${res.status}: ${url}`)
  return (await res.json()) as T
}

type GetCosmosChainApyDataInput = {
  chain: IbcEnabledCosmosChain
  /** Native staking denom (e.g. `uluna`). */
  stakingDenom: string
} & FetchOpts

export const getCosmosChainApyData = async ({
  chain,
  stakingDenom,
  fetchImpl,
  signal,
}: GetCosmosChainApyDataInput): Promise<CosmosChainApyData> => {
  const base = cosmosRpcUrl[chain]
  const opts = { fetchImpl, signal }

  const [inflationBody, poolBody, supplyBody, distParamsBody] =
    await Promise.all([
      lcdGet<{ inflation: string }>(
        `${base}/cosmos/mint/v1beta1/inflation`,
        opts
      ),
      lcdGet<{ pool: { bonded_tokens: string } }>(
        `${base}/cosmos/staking/v1beta1/pool`,
        opts
      ),
      lcdGet<{ amount: { denom: string; amount: string } }>(
        `${base}/cosmos/bank/v1beta1/supply/by_denom?denom=${encodeURIComponent(stakingDenom)}`,
        opts
      ),
      lcdGet<{ params: { community_tax: string } }>(
        `${base}/cosmos/distribution/v1beta1/params`,
        opts
      ),
    ])

  const inflation = inflationBody ? Number(inflationBody.inflation) : 0

  // Bonded ratio = bonded_tokens / total_supply for the staking denom. Both
  // are base-unit bigints that may exceed 2^53; collapsing to Number loses
  // precision well past what an APY display needs.
  let bondedRatio = 0
  if (poolBody && supplyBody) {
    const bonded = Number(poolBody.pool.bonded_tokens)
    const supply = Number(supplyBody.amount.amount)
    bondedRatio = supply > 0 ? bonded / supply : 0
  }

  const communityTax = distParamsBody
    ? Number(distParamsBody.params.community_tax)
    : 0

  return { inflation, bondedRatio, communityTax }
}

type ComputeValidatorApyInput = {
  chainData: CosmosChainApyData
  /** Validator commission as a Dec string from the staking module. */
  commissionRate: string
}

const clamp01 = (n: number): number => {
  if (!Number.isFinite(n) || n < 0) return 0
  if (n > 1) return 1
  return n
}

/**
 * Per-validator APY combining chain-level data with the validator's
 * commission rate. All numeric inputs are parsed from remote Dec strings,
 * so a malformed response can land NaN / negative / >1 values here.
 * Clamp inflation, communityTax, and commission into `[0, 1]`, and bail
 * out to 0 when bondedRatio is 0 / non-finite — better a missing APY row
 * than a negative or NaN-tainted percent in the UI.
 */
export const computeValidatorApy = ({
  chainData,
  commissionRate,
}: ComputeValidatorApyInput): number => {
  const inflation = clamp01(chainData.inflation)
  const communityTax = clamp01(chainData.communityTax)
  const commission = clamp01(Number(commissionRate))
  const bondedRatio = chainData.bondedRatio
  if (!Number.isFinite(bondedRatio) || bondedRatio <= 0 || inflation === 0) {
    return 0
  }
  const baseApy = (1 - communityTax) * (inflation / bondedRatio)
  return baseApy * (1 - commission)
}
