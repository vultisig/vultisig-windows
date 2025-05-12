import { AddressPage } from '@core/ui/chain/components/address/AddressPage'
import { ReshareVaultPage } from '@core/ui/mpc/keygen/reshare/ReshareVaultPage'
import { CoreViewId } from '@core/ui/navigation/CoreView'
import { CurrencyPage } from '@core/ui/preferences/currency'
import { DefaultChainsPage } from '@core/ui/preferences/default-chains'
import { LanguagePage } from '@core/ui/preferences/language'
import { ActiveVaultGuard } from '@core/ui/vault/ActiveVaultGuard'
import { VaultChainCoinPage } from '@core/ui/vault/chain/coin/VaultChainCoinPage'
import { ManageVaultChainsPage } from '@core/ui/vault/chain/manage'
import { ManageVaultChainCoinsPage } from '@core/ui/vault/chain/manage/coin/ManageVaultChainCoinsPage'
import { VaultChainPage } from '@core/ui/vault/chain/VaultChainPage'
import { ImportVaultPage } from '@core/ui/vault/import/components/ImportVaultPage'
import { NewVaultPage } from '@core/ui/vault/new'
import { SendPage } from '@core/ui/vault/send/SendPage'
import { VaultDetailsPage } from '@core/ui/vault/settings/details'
import { VaultRenamePage } from '@core/ui/vault/settings/rename'
import { SwapPage } from '@core/ui/vault/swap/components/SwapPage'
import { Views } from '@lib/ui/navigation/Views'

type SharedViewId = Extract<
  CoreViewId,
  | 'currencySettings'
  | 'defaultChains'
  | 'importVault'
  | 'languageSettings'
  | 'newVault'
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

export const sharedViews: Views<SharedViewId> = {
  address: AddressPage,
  currencySettings: CurrencyPage,
  defaultChains: DefaultChainsPage,
  importVault: ImportVaultPage,
  languageSettings: LanguagePage,
  manageVaultChains: () => (
    <ActiveVaultGuard>
      <ManageVaultChainsPage />
    </ActiveVaultGuard>
  ),
  manageVaultChainCoins: () => (
    <ActiveVaultGuard>
      <ManageVaultChainCoinsPage />
    </ActiveVaultGuard>
  ),
  newVault: NewVaultPage,
  renameVault: () => (
    <ActiveVaultGuard>
      <VaultRenamePage />
    </ActiveVaultGuard>
  ),
  reshareVault: () => (
    <ActiveVaultGuard>
      <ReshareVaultPage />
    </ActiveVaultGuard>
  ),
  send: () => (
    <ActiveVaultGuard>
      <SendPage />
    </ActiveVaultGuard>
  ),
  swap: () => (
    <ActiveVaultGuard>
      <SwapPage />
    </ActiveVaultGuard>
  ),
  vaultChainDetail: () => (
    <ActiveVaultGuard>
      <VaultChainPage />
    </ActiveVaultGuard>
  ),
  vaultChainCoinDetail: () => (
    <ActiveVaultGuard>
      <VaultChainCoinPage />
    </ActiveVaultGuard>
  ),
  vaultDetails: () => (
    <ActiveVaultGuard>
      <VaultDetailsPage />
    </ActiveVaultGuard>
  ),
}
