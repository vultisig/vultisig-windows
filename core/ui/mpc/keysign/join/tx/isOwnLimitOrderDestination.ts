import { Chain } from '@vultisig/core-chain/Chain'
import { getChainKind } from '@vultisig/core-chain/ChainKind'

type VaultAddress = {
  chain: Chain
  address: string
}

type IsOwnLimitOrderDestinationInput = {
  destinationAddress: string
  /** The buy chain, absent when the memo's asset prefix wasn't resolvable. */
  targetChain: Chain | undefined
  /** The joining vault's coins — its own address on each enabled chain. */
  coins: VaultAddress[]
}

/**
 * Whether a limit order pays out to one of this vault's own addresses.
 *
 * Drives the join review's external-recipient rule: an own-address payout is
 * the normal case and stays quiet, anything else is shown before signing. So
 * every uncertain branch must return `false` — the failure direction that
 * *shows* the address to the co-signer rather than hiding it.
 *
 * Comparison is scoped to the target chain and is case-insensitive only for
 * EVM, where checksum casing makes the same account render differently.
 * Everywhere else the compare is exact: base58 chains (Solana, Tron, ...) are
 * case-sensitive, so folding case could equate two distinct addresses and hide
 * a genuinely external payout; bech32 chains are canonically lowercase already.
 */
export const isOwnLimitOrderDestination = ({
  destinationAddress,
  targetChain,
  coins,
}: IsOwnLimitOrderDestinationInput): boolean => {
  if (!targetChain) {
    return false
  }

  const areEqual =
    getChainKind(targetChain) === 'evm'
      ? (a: string, b: string) => a.toLowerCase() === b.toLowerCase()
      : (a: string, b: string) => a === b

  return coins.some(
    coin =>
      coin.chain === targetChain && areEqual(coin.address, destinationAddress)
  )
}
