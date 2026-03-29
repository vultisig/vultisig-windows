import { Chain, CosmosChain } from '@core/chain/Chain'

/**
 * Chains where StargateClient cannot connect due to incompatible
 * validator pubkey types (e.g. MLDSA). Use REST API instead.
 */
export const restOnlyChains: CosmosChain[] = [Chain.QBTC]
