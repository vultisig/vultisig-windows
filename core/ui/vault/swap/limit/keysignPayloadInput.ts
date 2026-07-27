import { WalletCore } from '@trustwallet/wallet-core'
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { BuildLimitSwapKeysignPayloadInput } from '@vultisig/core-mpc/keysign/swap/buildLimitSwapKeysignPayload'
import { toKeysignLibType } from '@vultisig/core-mpc/types/utils/libType'
import { getVaultId, Vault } from '@vultisig/core-mpc/vault/Vault'

type GetLimitSwapKeysignPayloadInputInput = {
  fromCoin: AccountCoin
  toCoin: AccountCoin
  /** Source amount in the coin's native smallest units. */
  amount: bigint
  /** The `=<` memo from `buildLimitSwapMemoForCoins`. */
  memo: string
  /** The order's LIM in the target's smallest units, for co-signer display only. */
  expectedToAmount: bigint
  vault: Vault
  fromPublicKey: PublicKey
  toPublicKey: PublicKey
  walletCore: WalletCore
}

/**
 * Map the composed order plus the current vault into the SDK's keysign payload
 * input.
 *
 * Split out of the query hook so the mapping — which vault field feeds which
 * payload field — is testable without React. Getting one of these wrong (the
 * amount, the memo, or the wrong side's public key) would sign a different order
 * than the user reviewed, and none of it is caught by types alone since several
 * fields share a type.
 */
export const getLimitSwapKeysignPayloadInput = ({
  fromCoin,
  toCoin,
  amount,
  memo,
  expectedToAmount,
  vault,
  fromPublicKey,
  toPublicKey,
  walletCore,
}: GetLimitSwapKeysignPayloadInputInput): BuildLimitSwapKeysignPayloadInput => ({
  fromCoin,
  toCoin,
  amount,
  memo,
  expectedToAmount,
  vaultId: getVaultId(vault),
  localPartyId: vault.localPartyId,
  fromPublicKey,
  toPublicKey,
  libType: toKeysignLibType(vault),
  walletCore,
})
