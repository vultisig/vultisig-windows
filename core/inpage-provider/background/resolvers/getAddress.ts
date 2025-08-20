import { deriveAddress } from '@core/chain/publicKey/address/deriveAddress'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { getVault } from '@core/extension/storage/vaults'
import { getWalletCore } from '@core/extension/tw'
import { BackgroundResolver } from '@core/inpage-provider/background/resolver'

import { authorized } from '../middleware/authorized'

export const getAddress: BackgroundResolver<'getAddress'> = authorized(
  async ({ context: { vaultId }, input: { chain } }) => {
    const vault = await getVault(vaultId)

    const walletCore = await getWalletCore()

    const publicKey = getPublicKey({
      chain,
      walletCore,
      hexChainCode: vault.hexChainCode,
      publicKeys: vault.publicKeys,
    })

    return deriveAddress({
      chain,
      publicKey,
      walletCore,
    })
  }
)
