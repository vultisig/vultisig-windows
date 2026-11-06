import { EvmChain, OtherChain } from '@vultisig/core-chain/Chain'
import { Coin, Token } from '@vultisig/core-chain/coin/Coin'

/**
 * An ERC-20 allowance: `spender` may move up to `allowance` base units of
 * `token` straight from the vault.
 */
export type Erc20Approval = {
  kind: 'erc20'
  token: Token<Coin<EvmChain>>
  spender: string
  allowance: bigint
}

/**
 * A Permit2 allowance: `spender` may pull up to `allowance` base units of
 * `token` through the Permit2 contract until `expiration` (unix seconds).
 */
export type Permit2Approval = {
  kind: 'permit2'
  token: Token<Coin<EvmChain>>
  spender: string
  allowance: bigint
  expiration: number
}

/**
 * An SPL token delegate: `spender` may move up to `allowance` base units out
 * of the vault's token account `tokenAccount`, owned by `programId`.
 */
export type SplDelegateApproval = {
  kind: 'splDelegate'
  token: Token<Coin<typeof OtherChain.Solana>>
  spender: string
  allowance: bigint
  tokenAccount: string
  programId: string
}

/** One active permission to move the vault's tokens. */
export type TokenApproval =
  | Erc20Approval
  | Permit2Approval
  | SplDelegateApproval
