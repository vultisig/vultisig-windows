import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useVaults } from '@core/ui/storage/vaults'
import { Chain } from '@vultisig/core-chain/Chain'
import { getChainAddress } from '@vultisig/core-chain/publicKey/address/getChainAddress'
import { getSignatureAlgorithm } from '@vultisig/core-chain/signing/SignatureAlgorithm'
import { isKeyImportVault } from '@vultisig/core-mpc/vault/Vault'

import { getVaultNameForAddress } from './getVaultNameForAddress'

type UseVaultNameForAddressInput = {
  address: string
  chain: Chain
}

/**
 * Returns the vault name if the given address belongs to a stored or derivable
 * vault address on the given chain, otherwise null.
 *
 * Generic hook — not send-specific. Used across send, keysign, and address book contexts
 * anywhere the UI needs to identify whether an address is a known user vault.
 *
 * EVM chains share address space and addresses are normalized to lowercase to handle checksum
 * differences, matching the behaviour of useAddressBookNameForAddress.
 */
export const useVaultNameForAddress = ({
  address,
  chain,
}: UseVaultNameForAddressInput): string | null => {
  const vaults = useVaults()
  const walletCore = useAssertWalletCore()

  return getVaultNameForAddress({
    address,
    chain,
    vaults,
    deriveAddress: vault => {
      if (isKeyImportVault(vault) && !vault.chainPublicKeys?.[chain])
        return null
      if (getSignatureAlgorithm(chain) === 'mldsa' && !vault.publicKeyMldsa)
        return null

      try {
        return getChainAddress({
          chain,
          walletCore,
          hexChainCode: vault.hexChainCode,
          publicKeys: vault.publicKeys,
          publicKeyMldsa: vault.publicKeyMldsa,
          chainPublicKeys: vault.chainPublicKeys,
        })
      } catch {
        return null
      }
    },
  })
}
