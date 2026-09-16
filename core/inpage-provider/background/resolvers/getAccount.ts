import {
  isAppSessionAuthorizedForAccounts,
  isAppSessionAuthorizedForChain,
} from '@core/extension/storage/appSessionChainAuthorization'
import { tonW5EnabledStorage } from '@core/extension/storage/tonW5Enabled'
import { getVault } from '@core/extension/storage/vaults'
import { getWalletCore } from '@core/extension/tw'
import { BackgroundError } from '@core/inpage-provider/background/error'
import { BackgroundResolver } from '@core/inpage-provider/background/resolver'
import { getTonWalletVersion } from '@core/ui/storage/tonW5Enabled'
import { getChainAddress } from '@vultisig/core-chain/publicKey/address/getChainAddress'
import { getPublicKey } from '@vultisig/core-chain/publicKey/getPublicKey'
import { getSignatureAlgorithm } from '@vultisig/core-chain/signing/SignatureAlgorithm'
import { isKeyImportVault } from '@vultisig/core-mpc/vault/Vault'
import { assertField } from '@vultisig/lib-utils/record/assertField'

export const getAccount: BackgroundResolver<'getAccount'> = async ({
  context,
  input: { chain },
}) => {
  const appSession = assertField(context, 'appSession')
  if (!isAppSessionAuthorizedForChain({ appSession, chain })) {
    throw BackgroundError.Unauthorized
  }

  if (!isAppSessionAuthorizedForAccounts(appSession)) {
    throw BackgroundError.Unauthorized
  }

  const vault = await getVault(appSession.vaultId)

  if (isKeyImportVault(vault)) {
    const chainPublicKeys = assertField(vault, 'chainPublicKeys')
    if (!chainPublicKeys[chain]) {
      return { address: '', publicKey: '' }
    }
  }

  const signatureAlgorithm = getSignatureAlgorithm(chain)

  // MLDSA chains (e.g. QBTC) require a post-quantum key that older vaults
  // don't carry. Return empty so `requestAccount` re-prompts the user to
  // pick a vault that supports this chain, instead of throwing.
  if (signatureAlgorithm === 'mldsa' && !vault.publicKeyMldsa) {
    return { address: '', publicKey: '' }
  }

  const walletCore = await getWalletCore()

  // The account a dApp is told about has to be the one the wallet itself uses:
  // a TON vault on W5 holds its funds at a different address than V4R2, and a
  // session opened against the wrong one disagrees with every balance shown.
  const tonWalletVersion = getTonWalletVersion(
    await tonW5EnabledStorage.getIsTonW5Enabled()
  )

  const address = getChainAddress({
    chain,
    walletCore,
    hexChainCode: vault.hexChainCode,
    publicKeys: vault.publicKeys,
    publicKeyMldsa: vault.publicKeyMldsa,
    chainPublicKeys: vault.chainPublicKeys,
    tonWalletVersion,
  })

  if (signatureAlgorithm === 'mldsa') {
    return {
      address,
      publicKey: assertField(vault, 'publicKeyMldsa'),
    }
  }

  const publicKey = getPublicKey({
    chain,
    walletCore,
    hexChainCode: vault.hexChainCode,
    publicKeys: vault.publicKeys,
    chainPublicKeys: vault.chainPublicKeys,
  })

  return {
    address,
    publicKey: Buffer.from(publicKey.data()).toString('hex'),
  }
}
