import { lookupKnownEvmContract } from '@vultisig/core-chain/chains/evm/contract/knownContracts'

import { TokenApproval } from './TokenApproval'

/**
 * The protocol name of a well-known spender contract, or null when the
 * spender is not in the registry (Solana delegates never are).
 */
export const getSpenderLabel = (approval: TokenApproval): string | null =>
  approval.kind === 'splDelegate'
    ? null
    : (lookupKnownEvmContract(approval.spender, { chain: approval.token.chain })
        ?.label ?? null)
