import { tonW5EnabledStorage } from '@core/extension/storage/tonW5Enabled'
import { getWalletCore } from '@core/extension/tw'
import { getTonWalletVersion } from '@core/ui/storage/tonW5Enabled'
import { Chain } from '@vultisig/core-chain/Chain'
import { getChainAddress } from '@vultisig/core-chain/publicKey/address/getChainAddress'
import { getSignatureAlgorithm } from '@vultisig/core-chain/signing/SignatureAlgorithm'
import { isKeyImportVault, Vault } from '@vultisig/core-mpc/vault/Vault'
import { assertField } from '@vultisig/lib-utils/record/assertField'

type GetVaultChainAddressInput = {
  vault: Vault
  chain: Chain
}

/**
 * The address a dApp is told about for `chain`, derived from the vault's key
 * material, or `''` when the vault holds no key for that chain (a key-import
 * vault without it, or an MLDSA chain on a vault without an MLDSA key).
 */
export const getVaultChainAddress = async ({
  vault,
  chain,
}: GetVaultChainAddressInput): Promise<string> => {
  if (isKeyImportVault(vault)) {
    const chainPublicKeys = assertField(vault, 'chainPublicKeys')
    if (!chainPublicKeys[chain]) {
      return ''
    }
  }

  // MLDSA chains (e.g. QBTC) require a post-quantum key that older vaults
  // don't carry.
  if (getSignatureAlgorithm(chain) === 'mldsa' && !vault.publicKeyMldsa) {
    return ''
  }

  const walletCore = await getWalletCore()

  // The account a dApp is told about has to be the one the wallet itself uses:
  // a TON vault on W5 holds its funds at a different address than V4R2, and a
  // session opened against the wrong one disagrees with every balance shown.
  const tonWalletVersion = getTonWalletVersion(
    await tonW5EnabledStorage.getIsTonW5Enabled()
  )

  return getChainAddress({
    chain,
    walletCore,
    hexChainCode: vault.hexChainCode,
    publicKeys: vault.publicKeys,
    publicKeyMldsa: vault.publicKeyMldsa,
    chainPublicKeys: vault.chainPublicKeys,
    tonWalletVersion,
  })
}
