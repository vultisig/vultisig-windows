import { setCustomRpcOverrides } from '@vultisig/core-chain/chains/customRpc/customRpcOverrides'
import { useEffect } from 'react'

import { useHighestVaultDiscountTier } from '../vult/discount/queries/anyVaultTier'
import { hasReachedTier } from '../vult/discount/tierOrder'
import { useCustomRpcOverrides } from './customRpcOverrides'

/**
 * Hydrates the SDK's in-memory custom RPC override registry, which the
 * networking layer (balance / fee / broadcast) reads synchronously off the
 * React tree.
 *
 * Security gate: overrides are only applied when the user actually holds the
 * required VULT tier in at least one vault (entitlement is app-wide) — never
 * trusting persisted storage alone, since a user could hand-edit local storage
 * to inject overrides they aren't entitled to. The tier is verified against the
 * default (trusted) RPC: overrides are not applied until this check passes, so a
 * tampered RPC override can't itself spoof the balance the tier check reads.
 * When ineligible the registry is cleared, so the networking layer falls back to
 * the default endpoints.
 */
export const CustomRpcOverridesSync = () => {
  const overrides = useCustomRpcOverrides()
  const { tier } = useHighestVaultDiscountTier()
  const isEligible = hasReachedTier({ current: tier, required: 'silver' })

  useEffect(() => {
    setCustomRpcOverrides(isEligible ? overrides : {})
  }, [overrides, isEligible])

  return null
}
