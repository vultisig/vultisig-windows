import { ReshareVaultPage } from '@core/ui/mpc/keygen/reshare/ReshareVaultPage'
import { CorePath } from '@core/ui/navigation'
import { CurrencyPage } from '@core/ui/preferences/currency'
import { ActiveVaultGuard } from '@core/ui/vault/ActiveVaultGuard'
import { ReactNode } from 'react'

type SharedPaths = Extract<CorePath, 'currencySettings' | 'reshareVault'>

export const sharedRoutes: Record<SharedPaths, ReactNode> = {
  currencySettings: <CurrencyPage />,
  reshareVault: (
    <ActiveVaultGuard>
      <ReshareVaultPage />
    </ActiveVaultGuard>
  ),
}
