import { getCurrentVaultAddress } from '../core/getCurrentVaultAddress'
import { authorized } from '../middleware/authorized'
import { WalletApiResolver } from '../resolver'

export const eth_accounts: WalletApiResolver<'eth_accounts'> = authorized(
  async ({ input: { chain } }) => {
    const account = await getCurrentVaultAddress(chain)

    return [account]
  }
)
