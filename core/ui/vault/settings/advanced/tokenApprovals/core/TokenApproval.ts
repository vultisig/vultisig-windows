import { EvmChain } from '@vultisig/core-chain/Chain'
import { Coin, Token } from '@vultisig/core-chain/coin/Coin'

/**
 * An active ERC-20 allowance: the vault lets `spender` move up to `allowance`
 * base units of `token`. A max-uint256 allowance is shown as Unlimited.
 */
export type TokenApproval = {
  token: Token<Coin<EvmChain>>
  spender: string
  allowance: bigint
}
