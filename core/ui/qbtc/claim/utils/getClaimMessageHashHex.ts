import { WalletCore } from '@trustwallet/wallet-core'
import { Chain } from '@vultisig/core-chain/Chain'
import { computeAllClaimHashes } from '@vultisig/core-chain/chains/cosmos/qbtc/claim/computeClaimHashes'
import { getChainAddress } from '@vultisig/core-chain/publicKey/address/getChainAddress'
import { getPublicKey } from '@vultisig/core-chain/publicKey/getPublicKey'
import { Vault } from '@vultisig/core-mpc/vault/Vault'

import { qbtcChainId } from '../../dapp/qbtcDirectConstants'

type GetClaimMessageHashHexInput = {
  vault: Vault
  walletCore: WalletCore
}

/**
 * Recomputes the QBTC claim round-1 message hash purely from the vault's own
 * derived Bitcoin + QBTC keys — never from anything carried on the wire. Both
 * the initiating device and a secure-vault co-signer call this so they sign
 * the identical hash, and a co-signer can never be tricked into signing an
 * attacker-supplied Bitcoin spend (the claim digest is fully determined by the
 * vault).
 */
export const getClaimMessageHashHex = ({
  vault,
  walletCore,
}: GetClaimMessageHashHexInput): string => {
  const { hexChainCode, publicKeys, publicKeyMldsa, chainPublicKeys } = vault

  const btcAddress = getChainAddress({
    chain: Chain.Bitcoin,
    walletCore,
    hexChainCode,
    publicKeys,
    publicKeyMldsa,
    chainPublicKeys,
  })

  const qbtcAddress = getChainAddress({
    chain: Chain.QBTC,
    walletCore,
    hexChainCode,
    publicKeys,
    publicKeyMldsa,
    chainPublicKeys,
  })

  const btcPublicKey = getPublicKey({
    walletCore,
    hexChainCode,
    publicKeys,
    chainPublicKeys,
    chain: Chain.Bitcoin,
  })

  const { messageHash } = computeAllClaimHashes({
    btcAddress,
    compressedPubkey: btcPublicKey.data(),
    qbtcAddress,
    chainId: qbtcChainId,
  })

  return Buffer.from(messageHash).toString('hex')
}
