import { Chain } from '@core/chain/Chain'
import { getMoneroAddress } from '@core/chain/chains/monero/getMoneroAddress'
import { encodeMoneroPublicKeyHex } from '@core/chain/chains/monero/moneroPublicKey'
import { deriveAddress } from '@core/chain/publicKey/address/deriveAddress'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { getVault } from '@core/extension/storage/vaults'
import { getWalletCore } from '@core/extension/tw'
import { BackgroundResolver } from '@core/inpage-provider/background/resolver'
import { isKeyImportVault } from '@core/mpc/vault/Vault'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { assertField } from '@lib/utils/record/assertField'

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

  if (chain === Chain.Monero) {
    const keyShare = shouldBePresent(vault.chainKeyShares?.[Chain.Monero])
    const publicKey = shouldBePresent(vault.chainPublicKeys?.[Chain.Monero])

    return {
      address: await getMoneroAddress(keyShare),
      publicKey: encodeMoneroPublicKeyHex(publicKey),
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
