import { ReshareVaultPage } from '@core/ui/mpc/keygen/reshare/ReshareVaultPage'
import { CorePath } from '@core/ui/navigation'
import { CurrencyPage } from '@core/ui/preferences/currency'
import { DefaultChainsPage } from '@core/ui/preferences/default-chains'
import { ActiveVaultGuard } from '@core/ui/vault/ActiveVaultGuard'
import { ReactNode } from 'react'

type SharedPaths = Extract<
  CorePath,
  'currencySettings' | 'defaultChains' | 'reshareVault'
>

export const sharedRoutes: Record<SharedPaths, ReactNode> = {
  currencySettings: <CurrencyPage />,
  defaultChains: <DefaultChainsPage />,
  reshareVault: (
    <ActiveVaultGuard>
      <ReshareVaultPage />
    </ActiveVaultGuard>
  ),
}
