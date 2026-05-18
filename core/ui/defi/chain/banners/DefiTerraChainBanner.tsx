import { IbcEnabledCosmosChain } from '@vultisig/core-chain/Chain'

import { DefiTerraBalanceBanner } from './DefiTerraBalanceBanner'

type DefiTerraChainBannerProps = {
  chain: IbcEnabledCosmosChain
  title: string
}

/**
 * Banner-registry wrapper. The Terra banner needs to know `chain` and a
 * display `title`, but the registry contract is `ComponentType<{}>`. This
 * wrapper closes over the props so each entry in the registry stays
 * zero-prop while the underlying banner remains reusable across chains.
 *
 * Total fiat is currently 0 — a LUNA / LUNC spot-price feed is a follow-up.
 */
export const DefiTerraChainBanner = ({
  chain,
  title,
}: DefiTerraChainBannerProps) => (
  <DefiTerraBalanceBanner chain={chain} title={title} totalFiat={0} />
)
