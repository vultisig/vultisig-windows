import { ReshareVaultPage } from '@core/ui/mpc/keygen/reshare/ReshareVaultPage'
import { CorePath } from '@core/ui/navigation'
import { CurrencyPage } from '@core/ui/preferences/currency'
import { VaultDefaultChainsPage } from '@core/ui/preferences/vaultDefaultChains/VaultDefaultChainsPage'
import { ActiveVaultGuard } from '@core/ui/vault/ActiveVaultGuard'
import { ReactNode } from 'react'

import { ReshareVaultPage } from '../mpc/keygen/reshare/ReshareVaultPage'

type SharedPaths = Extract<
  CorePath,
  'currencySettings' | 'reshareVault' | 'defaultChains'
>

export const sharedRoutes: Record<SharedPaths, ReactNode> = {
  currencySettings: <CurrencyPage />,
  defaultChains: <VaultDefaultChainsPage />,
  reshareVault: (
    <ActiveVaultGuard>
      <ReshareVaultPage />
    </ActiveVaultGuard>
  ),
}
