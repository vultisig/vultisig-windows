import { create } from '@bufbuild/protobuf'
import { Chain } from '@vultisig/core-chain/Chain'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { KeysignMessagePayload } from '@vultisig/core-mpc/keysign/keysignPayload/KeysignMessagePayload'
import { toCommCoin } from '@vultisig/core-mpc/types/utils/commCoin'
import { UTXOSpecificSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { KeysignPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { getVaultId, Vault } from '@vultisig/core-mpc/vault/Vault'

type GetClaimKeysignPayloadInput = {
  vault: Vault
  btcAddress: string
  btcPublicKeyHex: string
  /** QBTC claim recipient address, surfaced to the co-signer's verify screen
   * via `toAddress`. */
  qbtcAddress: string
  /** Total claimed amount in satoshis, surfaced to the co-signer's verify
   * screen. Advisory metadata only — round 1's signature doesn't commit to it. */
  claimAmount: string
}

/**
 * Builds the pairing-QR payload for a secure-vault QBTC claim round 1. It is a
 * normal Bitcoin keysign payload carrying no signing material — only the
 * `isQbtcClaim` flag. The co-signing device recomputes the claim hash from its
 * own vault (see `getClaimMessageHashHex`), so nothing here can divert the
 * Bitcoin signature. Wire-compatible with the iOS/Android `is_qbtc_claim`
 * flow.
 */
export const getClaimKeysignPayload = ({
  vault,
  btcAddress,
  btcPublicKeyHex,
  qbtcAddress,
  claimAmount,
}: GetClaimKeysignPayloadInput): KeysignMessagePayload => ({
  keysign: create(KeysignPayloadSchema, {
    coin: toCommCoin({
      chain: Chain.Bitcoin,
      ticker: chainFeeCoin[Chain.Bitcoin].ticker,
      logo: chainFeeCoin[Chain.Bitcoin].logo,
      decimals: chainFeeCoin[Chain.Bitcoin].decimals,
      priceProviderId: chainFeeCoin[Chain.Bitcoin].priceProviderId,
      address: btcAddress,
      hexPublicKey: btcPublicKeyHex,
    }),
    blockchainSpecific: {
      case: 'utxoSpecific',
      value: create(UTXOSpecificSchema, {
        byteFee: '0',
        sendMaxAmount: false,
      }),
    },
    // `toAddress` carries the QBTC claim recipient and `toAmount` the claimed
    // total (satoshis), both surfaced on the co-signer's verify screen. Other
    // platforms ignore them for claims but still parse `toAmount` as a number
    // (e.g. Android `BigInteger(toAmount)`), so it must be numeric.
    toAddress: qbtcAddress,
    toAmount: claimAmount,
    vaultPublicKeyEcdsa: getVaultId(vault),
    vaultLocalPartyId: vault.localPartyId,
    libType: vault.libType,
    isQbtcClaim: true,
    skipBroadcast: true,
  }),
})
