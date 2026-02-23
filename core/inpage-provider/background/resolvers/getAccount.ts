import { deriveAddress } from '@core/chain/publicKey/address/deriveAddress'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { getVault } from '@core/extension/storage/vaults'
import { getWalletCore } from '@core/extension/tw'
import { BackgroundResolver } from '@core/inpage-provider/background/resolver'
import { isKeyImportVault } from '@core/mpc/vault/Vault'
import { assertField } from '@lib/utils/record/assertField'

export const getAccount: BackgroundResolver<'getAccount'> = async ({
  context,
  input: { chain },
}) => {
  const appSession = assertField(context, 'appSession')
  const vault = await getVault(appSession.vaultId)

  if (isKeyImportVault(vault) && !vault.chainPublicKeys?.[chain]) {
    return { address: '', publicKey: '' }
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
