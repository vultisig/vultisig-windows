import { WalletCore } from '@trustwallet/wallet-core'
import { Chain } from '@vultisig/core-chain/Chain'
import { getChainAddress } from '@vultisig/core-chain/publicKey/address/getChainAddress'
import { Vault } from '@vultisig/core-mpc/vault/Vault'

type GetClaimAddressesInput = {
  vault: Vault
  walletCore: WalletCore
}

/**
 * The Bitcoin address a QBTC claim spends from and the QBTC address it mints
 * to, derived from the vault's own keys. Both go into the signed claim
 * message, so every device derives them the same way instead of reading them
 * off the wire.
 */
export const getClaimAddresses = ({
  vault: { hexChainCode, publicKeys, publicKeyMldsa, chainPublicKeys },
  walletCore,
}: GetClaimAddressesInput) => {
  const [bitcoinAddress, qbtcAddress] = [Chain.Bitcoin, Chain.QBTC].map(chain =>
    getChainAddress({
      chain,
      walletCore,
      hexChainCode,
      publicKeys,
      publicKeyMldsa,
      chainPublicKeys,
    })
  )

  return { bitcoinAddress, qbtcAddress }
}
