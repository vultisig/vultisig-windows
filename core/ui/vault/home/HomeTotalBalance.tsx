import { VaultTotalBalance } from '../page/balance/VaultTotalBalance'
import { HomeBalanceQuery } from './HomeBalanceQuery'

/** The home header's large balance for the current tab and display setting. */
export const HomeTotalBalance = () => (
  <HomeBalanceQuery>
    {query => <VaultTotalBalance query={query} />}
  </HomeBalanceQuery>
)
