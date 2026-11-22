import { WalletCore } from '@trustwallet/wallet-core'
import { computeClaimMessageHash } from '@vultisig/core-chain/chains/cosmos/qbtc/claim/computeClaimHashes'
import { Vault } from '@vultisig/core-mpc/vault/Vault'

import { qbtcChainId } from '../../dapp/qbtcDirectConstants'
import { getClaimAddresses } from './getClaimAddresses'

type GetClaimMessageHashHexInput = {
  vault: Vault
  walletCore: WalletCore
}

/**
 * Recomputes the QBTC claim round-1 message hash purely from the vault's own
 * derived Bitcoin + QBTC addresses — never from anything carried on the wire.
 * Both the initiating device and a secure-vault co-signer call this so they
 * sign the identical hash, and a co-signer can never be tricked into signing
 * an attacker-supplied Bitcoin spend: the hash is the BIP-137 digest of
 * `qbtc-claim-v1|<chain-id>|<bitcoin address>|<qbtc address>`.
 */
export const getClaimMessageHashHex = ({
  vault,
  walletCore,
}: GetClaimMessageHashHexInput): string => {
  const { bitcoinAddress, qbtcAddress } = getClaimAddresses({
    vault,
    walletCore,
  })

  const messageHash = computeClaimMessageHash({
    chainId: qbtcChainId,
    bitcoinAddress,
    qbtcAddress,
  })

  return Buffer.from(messageHash).toString('hex')
}
