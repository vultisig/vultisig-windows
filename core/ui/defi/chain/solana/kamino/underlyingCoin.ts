import { Chain } from '@vultisig/core-chain/Chain'
import { kaminoConfig } from '@vultisig/core-chain/chains/solana/kamino/config'
import { KaminoVaultDescriptor } from '@vultisig/core-chain/chains/solana/kamino/registry'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import { knownTokensIndex } from '@vultisig/core-chain/coin/knownTokens'

/**
 * The coin a vault's balance is denominated and priced in — its UNDERLYING
 * token, never its share mint.
 *
 * One helper rather than a lookup at each site, because the position tile and
 * the Earn card have to agree: a tile showing the chain's logo beside a card
 * showing the token's would read as two different vaults.
 *
 * The SOL vault's underlying is wrapped SOL, which the token store does not
 * carry — wrapping is a 1:1 escrow of the native coin and the two share a
 * price, so it resolves to native SOL.
 *
 * `knownTokensIndex` is keyed by LOWERCASED id, while a Solana mint is
 * case-sensitive base58, so the mint has to be lowered for the lookup. It
 * returns the known token itself, whose `id` keeps the mint's real case —
 * which is what the price query keys on.
 *
 * A mint the token store does not carry still yields a coin, built from the
 * registry's own pinned mint and decimals: a vault must not vanish from the
 * list because its logo is unknown. `kaminoUnderlyingCoin.test.ts` pins that
 * every curated vault resolves to a KNOWN token today, so that fallback stays
 * a guard rather than a silent downgrade.
 */
export const kaminoUnderlyingCoin = (
  descriptor: KaminoVaultDescriptor
): Coin => {
  const { tokenMint, tokenDecimals, fallbackName } = descriptor

  if (tokenMint === kaminoConfig.wrappedSolMint) {
    return chainFeeCoin[Chain.Solana]
  }

  return (
    knownTokensIndex[Chain.Solana]?.[tokenMint.toLowerCase()] ?? {
      chain: Chain.Solana,
      id: tokenMint,
      ticker: fallbackName,
      decimals: tokenDecimals,
    }
  )
}
