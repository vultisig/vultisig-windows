import { DepositPage } from './DepositPage'
import { DepositAccessGuard } from './providers/DepositAccessGuard'
import { DepositActionProvider } from './providers/DepositActionProvider'
import { DepositCoinProvider } from './providers/DepositCoinProvider'

/** The deposit page with its access guard and action/coin providers, as registered in the shared navigation. */
export const DepositView = () => (
  <DepositAccessGuard>
    <DepositActionProvider>
      <DepositCoinProvider>
        <DepositPage />
      </DepositCoinProvider>
    </DepositActionProvider>
  </DepositAccessGuard>
)
