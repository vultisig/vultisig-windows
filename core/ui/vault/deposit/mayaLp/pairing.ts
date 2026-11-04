import { mayanodeBaseUrl } from '../../../defi/chain/queries/constants'

/** A vault's record on one MayaChain pool, as far as pairing needs it. */
export type MayachainLiquidityProvider = {
  cacao_address?: string
  asset_address?: string
  units: string
  pending_cacao?: string
  pending_asset?: string
  pending_tx_id?: string
}

type FetchMayachainLiquidityProviderInput = {
  pool: string
  address: string
}

/**
 * Reads the address's record on a MayaChain pool. Returns `null` only when
 * mayanode has no record; any other failure throws, since a caller about to
 * move funds must not guess.
 */
export const fetchMayachainLiquidityProvider = async ({
  pool,
  address,
}: FetchMayachainLiquidityProviderInput): Promise<MayachainLiquidityProvider | null> => {
  const response = await fetch(
    `${mayanodeBaseUrl}/pool/${pool}/liquidity_provider/${address}`,
    { headers: { 'X-Client-ID': 'vultisig' } }
  )

  if (response.status === 404) return null

  if (!response.ok) {
    throw new Error(`MayaChain LP record request failed: ${response.status}`)
  }

  return response.json()
}

/**
 * - `pairable`: an add naming these addresses is credited, or held pending.
 * - `cacaoOnly`: a live position with no asset address. Only a `+:POOL`
 *   CACAO add is credited; one naming an asset address is refunded.
 * - `pairedWithOther`: a live position paired with another asset address.
 *   A `+:POOL` CACAO add is still credited; one naming this address is not.
 * - `mismatch`: a pending half already fixed other addresses.
 */
export type MayaLpPairing =
  | 'pairable'
  | 'cacaoOnly'
  | 'pairedWithOther'
  | 'mismatch'

type GetMayaLpPairingInput = {
  provider: MayachainLiquidityProvider | null
  cacaoAddress: string
  assetAddress: string | undefined
}

const isPositive = (value: string | undefined) =>
  value !== undefined && /^\d+$/.test(value) && BigInt(value) > 0n

const isSameAddress = (a: string | undefined, b: string | undefined) =>
  (a ?? '').toLowerCase() === (b ?? '').toLowerCase()

/**
 * Mirrors mayanode's `addLiquidity` address rules. A fresh record takes the
 * addresses the add names; a pending half fixed both when it arrived; a live
 * position keeps the asset address it was created with, or none.
 */
export const getMayaLpPairing = ({
  provider,
  cacaoAddress,
  assetAddress,
}: GetMayaLpPairingInput): MayaLpPairing => {
  if (!provider) return 'pairable'

  if (!isPositive(provider.units)) {
    const hasPendingHalf =
      Boolean(provider.pending_tx_id) ||
      isPositive(provider.pending_cacao) ||
      isPositive(provider.pending_asset)

    if (!hasPendingHalf) return 'pairable'

    return isSameAddress(provider.cacao_address, cacaoAddress) &&
      isSameAddress(provider.asset_address, assetAddress)
      ? 'pairable'
      : 'mismatch'
  }

  if (!provider.asset_address) return 'cacaoOnly'

  return isSameAddress(provider.asset_address, assetAddress)
    ? 'pairable'
    : 'pairedWithOther'
}

type GetMayaLpPairedAddressInput = {
  isCacaoSide: boolean
  pairing: MayaLpPairing
  cacaoAddress: string
  assetAddress: string | undefined
}

/**
 * The address the add's memo should name: an empty string for a CACAO-only
 * `+:POOL` add, or `null` when MayaChain would refund the add either way.
 * The asset side always names the CACAO address, so it only goes ahead when
 * the record pairs.
 */
export const getMayaLpPairedAddress = ({
  isCacaoSide,
  pairing,
  cacaoAddress,
  assetAddress,
}: GetMayaLpPairedAddressInput): string | null => {
  if (!isCacaoSide) return pairing === 'pairable' ? cacaoAddress : null

  if (pairing === 'mismatch') return null

  return pairing === 'pairable' ? (assetAddress ?? '') : ''
}
