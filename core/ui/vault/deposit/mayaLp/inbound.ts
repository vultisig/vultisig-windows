import { ThorchainInboundAddress } from '@vultisig/core-chain/chains/cosmos/thor/getThorchainInboundAddress'
import { queryUrl } from '@vultisig/lib-utils/query/queryUrl'

import { mayanodeBaseUrl } from '../../../defi/chain/queries/constants'

/** Fetches MayaChain's inbound vaults; mayanode serves THORChain's shape. */
const getMayachainInboundAddresses = () =>
  queryUrl<ThorchainInboundAddress[]>(`${mayanodeBaseUrl}/inbound_addresses`, {
    headers: { 'X-Client-ID': 'vultisig' },
  })

// MayaChain normalises every chain's amounts to 8 decimals.
const mayaInboundDecimals = 8

type AssertMayaLpInboundOpenInput = {
  inbound: ThorchainInboundAddress
  /** The asset side's amount in the coin's base units; omitted for the CACAO side. */
  amount?: { units: bigint; decimals: number }
}

/**
 * Throws when MayaChain would refund or ignore an LP add on the inbound's
 * chain: a halted chain, paused LP actions or trading, or an asset-side
 * amount under the dust threshold, which the observer never picks up.
 */
export const assertMayaLpInboundOpen = ({
  inbound,
  amount,
}: AssertMayaLpInboundOpenInput) => {
  if (inbound.halted) {
    throw new Error(`${inbound.chain} chain is currently halted on MayaChain`)
  }
  if (
    inbound.chain_lp_actions_paused ||
    inbound.chain_trading_paused ||
    inbound.global_trading_paused
  ) {
    throw new Error(
      `LP actions are currently paused for ${inbound.chain} on MayaChain`
    )
  }

  if (!amount) return

  const dustUnits =
    BigInt(inbound.dust_threshold || '0') *
    10n ** BigInt(amount.decimals - mayaInboundDecimals)

  if (amount.units < dustUnits) {
    throw new Error(
      `The amount is below MayaChain's ${inbound.chain} minimum, which it would not credit`
    )
  }
}

type GetOpenMayaLpInboundInput = Omit<
  AssertMayaLpInboundOpenInput,
  'inbound'
> & {
  chainCode: string
}

/**
 * Finds MayaChain's inbound for the chain code and checks it takes LP adds.
 * `undefined` when mayanode lists none, as for a pool on MayaChain itself.
 */
export const getOpenMayaLpInbound = async ({
  chainCode,
  amount,
}: GetOpenMayaLpInboundInput) => {
  const inbounds = await getMayachainInboundAddresses()
  const inbound = inbounds.find(
    ({ chain }) => chain.toUpperCase() === chainCode.toUpperCase()
  )

  if (inbound) assertMayaLpInboundOpen({ inbound, amount })

  return inbound
}
