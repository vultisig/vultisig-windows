import { useHomeDisplay } from '@core/ui/storage/homeDisplay'

import { VaultTotalBalance } from '../page/balance/VaultTotalBalance'
import { HomeBalanceQuery } from './HomeBalanceQuery'

/** The home header's large balance for the current tab and display setting. */
export const HomeTotalBalance = () => {
  const isTotal = useHomeDisplay() === 'combined'

  return (
    <HomeBalanceQuery>
      {query => <VaultTotalBalance query={query} isTotal={isTotal} />}
    </HomeBalanceQuery>
  )
}
