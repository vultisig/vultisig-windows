import { Chain } from '@vultisig/core-chain/Chain'
import { isChainOfKind } from '@vultisig/core-chain/ChainKind'

/**
 * Picks the label for the swap's network fee row. EVM gas is quoted as
 * `gasLimit × maxFeePerGas` — the most the transaction can cost rather than
 * what it will — so the row says so, in line with the "Max. Total Fee" line
 * below it. Every other kind quotes an exact fee and keeps the plain label.
 */
export const getSwapNetworkFeeLabelKey = (chain: Chain) =>
  isChainOfKind(chain, 'evm') ? 'max_network_fee' : 'network_fee'
