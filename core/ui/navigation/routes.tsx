import { ReshareVaultPage } from '@core/ui/mpc/keygen/reshare/ReshareVaultPage'
import { CorePath } from '@core/ui/navigation'
import { CurrencyPage } from '@core/ui/preferences/currency'
import { DefaultChainsPage } from '@core/ui/preferences/default-chains'
import { ActiveVaultGuard } from '@core/ui/vault/ActiveVaultGuard'
import { ManageVaultChainsPage } from '@core/ui/vault/chain/manage'
import { VaultRenamePage } from '@core/ui/vault/settings/rename'
import { ReactNode } from 'react'

type SharedPaths = Extract<
  CorePath,
  | 'currencySettings'
  | 'defaultChains'
  | 'manageVaultChains'
  | 'renameVault'
  | 'reshareVault'
>

export const sharedRoutes: Record<SharedPaths, ReactNode> = {
  currencySettings: <CurrencyPage />,
  defaultChains: <DefaultChainsPage />,
  manageVaultChains: (
    <ActiveVaultGuard>
      <ManageVaultChainsPage />
    </ActiveVaultGuard>
  ),
  renameVault: (
    <ActiveVaultGuard>
      <VaultRenamePage />
    </ActiveVaultGuard>
  ),
  reshareVault: (
    <ActiveVaultGuard>
      <ReshareVaultPage />
    </ActiveVaultGuard>
  ),
}
