import { useHomeDisplay } from '@core/ui/storage/homeDisplay'
import { Suspense } from 'react'

import { useHomeTab } from './homeTab'
import { LazyDefiAwareBalanceQuery } from './lazyDefiHome'
import { pendingHomeBalanceQuery, RenderHomeBalance } from './renderHomeBalance'
import { WalletBalanceQuery } from './WalletBalanceQuery'

type HomeBalanceQueryProps = {
  children: RenderHomeBalance
}

/** The wallet-only case never loads DeFi code or data. */
export const HomeBalanceQuery = ({ children }: HomeBalanceQueryProps) => {
  const display = useHomeDisplay()
  const tab = useHomeTab()

  if (display === 'separate' && tab === 'wallet') {
    return <WalletBalanceQuery>{children}</WalletBalanceQuery>
  }

  return (
    <Suspense fallback={children(pendingHomeBalanceQuery)}>
      <LazyDefiAwareBalanceQuery display={display} tab={tab}>
        {children}
      </LazyDefiAwareBalanceQuery>
    </Suspense>
  )
}
