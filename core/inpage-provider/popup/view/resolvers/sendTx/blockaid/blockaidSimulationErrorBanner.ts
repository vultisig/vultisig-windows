import { Chain } from '@vultisig/core-chain/Chain'
import { isChainOfKind } from '@vultisig/core-chain/ChainKind'

/**
 * Whether the standalone Blockaid simulation-error banner should render for a
 * chain in the send-tx overview. Covers the chains whose Blockaid simulation is
 * surfaced there: any EVM chain plus Solana.
 */
export const hasBlockaidSimulationErrorBanner = (chain: Chain): boolean =>
  isChainOfKind(chain, 'evm') || chain === Chain.Solana
