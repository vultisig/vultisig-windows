import { Chain } from '@core/chain/Chain'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { storage } from '@core/extension/storage'
import { getWalletCore } from '@core/extension/tw'
import { getVaultId } from '@core/ui/vault/Vault'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

import { BitcoinAccount, RequestContext } from '../../../utils/interfaces'
import { handleFindAccounts } from '../accountsHandler'

type HandleBtcRequestAccountsParams = {
  sender: string
  context?: RequestContext
}
export const handleBtcRequestAccounts = async ({
  context,
  sender,
}: HandleBtcRequestAccountsParams): Promise<BitcoinAccount[] | string[]> => {
  const [address] = await handleFindAccounts(Chain.Bitcoin, sender)
  const isPhantom = context?.provider === 'phantom-override'
  if (isPhantom) {
    const walletCore = await getWalletCore()
    const currentVaultId = await storage.getCurrentVaultId()
    const vaults = await storage.getVaults()
    const currentVault = shouldBePresent(
      vaults.find(v => getVaultId(v) === currentVaultId)
    )

    const publicKey = getPublicKey({
      chain: Chain.Bitcoin,
      walletCore,
      hexChainCode: currentVault.hexChainCode,
      publicKeys: currentVault.publicKeys,
    })

    const base = {
      address,
      publicKey: Buffer.from(publicKey.data()).toString('hex'),
    }

    // Return Phantom BTC account(s)
    return [
      { ...base, addressType: 'p2wpkh', purpose: 'payment' },
      { ...base, addressType: 'p2wpkh', purpose: 'ordinals' },
    ]
  }

  return [address]
}
