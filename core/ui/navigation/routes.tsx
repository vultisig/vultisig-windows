import { ReshareVaultPage } from '@core/ui/mpc/keygen/reshare/ReshareVaultPage'
import { CorePath } from '@core/ui/navigation'
import { CurrencyPage } from '@core/ui/preferences/currency'
import { DefaultChainsPage } from '@core/ui/preferences/default-chains'
import { LanguagePage } from '@core/ui/preferences/language'
import { ActiveVaultGuard } from '@core/ui/vault/ActiveVaultGuard'
import { ManageVaultChainsPage } from '@core/ui/vault/chain/manage'
import { VaultDetailsPage } from '@core/ui/vault/settings/details'
import { VaultRenamePage } from '@core/ui/vault/settings/rename'
import { ReactNode } from 'react'

import { SendPage } from '../vault/send/SendPage'

type SharedPaths = Extract<
  CorePath,
  | 'currencySettings'
  | 'defaultChains'
  | 'languageSettings'
  | 'manageVaultChains'
  | 'renameVault'
  | 'reshareVault'
  | 'vaultDetails'
  | 'manageVaultChains'
  | 'reshareVault'
  | 'send'
>

export const sharedRoutes: Record<SharedPaths, ReactNode> = {
  currencySettings: <CurrencyPage />,
  defaultChains: <DefaultChainsPage />,
  languageSettings: <LanguagePage />,
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
  vaultDetails: (
    <ActiveVaultGuard>
      <VaultDetailsPage />
    </ActiveVaultGuard>
  ),
  send: (
    <ActiveVaultGuard>
      <SendPage />
    </ActiveVaultGuard>
  ),
}
