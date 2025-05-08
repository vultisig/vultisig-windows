import { AddressPage } from '@core/ui/chain/components/address/AddressPage'
import { ReshareVaultPage } from '@core/ui/mpc/keygen/reshare/ReshareVaultPage'
import { CorePath } from '@core/ui/navigation'
import { CurrencyPage } from '@core/ui/preferences/currency'
import { DefaultChainsPage } from '@core/ui/preferences/default-chains'
import { LanguagePage } from '@core/ui/preferences/language'
import { ActiveVaultGuard } from '@core/ui/vault/ActiveVaultGuard'
import { VaultChainCoinPage } from '@core/ui/vault/chain/coin/VaultChainCoinPage'
import { ManageVaultChainsPage } from '@core/ui/vault/chain/manage'
import { ManageVaultChainCoinsPage } from '@core/ui/vault/chain/manage/coin/ManageVaultChainCoinsPage'
import { VaultChainPage } from '@core/ui/vault/chain/VaultChainPage'
import { SendPage } from '@core/ui/vault/send/SendPage'
import { VaultDetailsPage } from '@core/ui/vault/settings/details'
import { VaultRenamePage } from '@core/ui/vault/settings/rename'
import { SwapPage } from '@core/ui/vault/swap/components/SwapPage'
import { ReactNode } from 'react'

type SharedPaths = Extract<
  CorePath,
  | 'currencySettings'
  | 'defaultChains'
  | 'languageSettings'
  | 'renameVault'
  | 'vaultDetails'
  | 'vaultChainDetail'
  | 'vaultChainCoinDetail'
  | 'manageVaultChainCoins'
  | 'address'
  | 'manageVaultChains'
  | 'reshareVault'
  | 'send'
  | 'swap'
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
  swap: (
    <ActiveVaultGuard>
      <SwapPage />
    </ActiveVaultGuard>
  ),
  vaultChainDetail: (
    <ActiveVaultGuard>
      <VaultChainPage />
    </ActiveVaultGuard>
  ),
  vaultChainCoinDetail: (
    <ActiveVaultGuard>
      <VaultChainCoinPage />
    </ActiveVaultGuard>
  ),
  manageVaultChainCoins: (
    <ActiveVaultGuard>
      <ManageVaultChainCoinsPage />
    </ActiveVaultGuard>
  ),
  address: <AddressPage />,
}
