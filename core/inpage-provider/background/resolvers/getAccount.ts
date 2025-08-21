import { deriveAddress } from '@core/chain/publicKey/address/deriveAddress'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { getVault } from '@core/extension/storage/vaults'
import { getWalletCore } from '@core/extension/tw'
import { BackgroundResolver } from '@core/inpage-provider/background/resolver'

import { authorized } from '../middleware/authorized'

export const getAccount: BackgroundResolver<'getAccount'> = authorized(
  async ({ context: { appSession }, input: { chain } }) => {
    const vault = await getVault(appSession.vaultId)

    const walletCore = await getWalletCore()

    const publicKey = getPublicKey({
      chain,
      walletCore,
      hexChainCode: vault.hexChainCode,
      publicKeys: vault.publicKeys,
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
)
