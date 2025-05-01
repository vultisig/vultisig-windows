import { ReactNode } from 'react'

import { ReshareVaultPage } from '../mpc/keygen/reshare/ReshareVaultPage'
import { CurrencyPage } from '../preferences/currency/CurrencyPage'
import { ActiveVaultGuard } from '../vault/ActiveVaultGuard'

type SharedPaths = 'reshareVault' | 'currencySettings'

export const sharedRoutes: Record<SharedPaths, ReactNode> = {
  reshareVault: (
    <ActiveVaultGuard>
      <ReshareVaultPage />
    </ActiveVaultGuard>
  ),
  currencySettings: <CurrencyPage />,
}
