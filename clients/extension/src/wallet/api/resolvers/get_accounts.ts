import { getCurrentVaultAddress } from '../core/getCurrentVaultAddress'
import { authorized } from '../middleware/authorized'
import { WalletApiResolver } from '../resolver'

export const get_accounts: WalletApiResolver<'get_accounts'> = authorized(
  async ({ input: { chain } }) => {
    const account = await getCurrentVaultAddress(chain)

    return [account]
  }
)
