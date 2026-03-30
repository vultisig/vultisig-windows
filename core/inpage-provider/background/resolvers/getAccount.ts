import { getVault } from '@core/extension/storage/vaults'
import { getWalletCore } from '@core/extension/tw'
import { BackgroundResolver } from '@core/inpage-provider/background/resolver'
import { deriveAddress } from '@vultisig/core-chain/publicKey/address/deriveAddress'
import { getPublicKey } from '@vultisig/core-chain/publicKey/getPublicKey'
import { isKeyImportVault } from '@vultisig/core-mpc/vault/Vault'
import { assertField } from '@vultisig/lib-utils/record/assertField'

export const getAccount: BackgroundResolver<'getAccount'> = async ({
  context,
  input: { chain },
}) => {
  const appSession = assertField(context, 'appSession')
  const vault = await getVault(appSession.vaultId)

  if (isKeyImportVault(vault)) {
    const chainPublicKeys = assertField(vault, 'chainPublicKeys')
    if (!chainPublicKeys[chain]) {
      return { address: '', publicKey: '' }
    }
  }

  const walletCore = await getWalletCore()

  const publicKey = getPublicKey({
    chain,
    walletCore,
    hexChainCode: vault.hexChainCode,
    publicKeys: vault.publicKeys,
    chainPublicKeys: vault.chainPublicKeys,
  })

  const address = deriveAddress({
    chain,
    publicKey,
    walletCore,
  })

  return {
    address,
    publicKey: Buffer.from(publicKey.data()).toString('hex'),
  }
}
