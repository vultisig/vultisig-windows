import { AddressPage } from '@core/ui/chain/components/address/AddressPage'
import { ReshareVaultPage } from '@core/ui/mpc/keygen/reshare/ReshareVaultPage'
import { CoreViewId } from '@core/ui/navigation/CoreView'
import { CurrencyPage } from '@core/ui/preferences/currency'
import { DefaultChainsPage } from '@core/ui/preferences/default-chains'
import { LanguagePage } from '@core/ui/preferences/language'
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
import { CurrentVaultFolderPageProvider } from '@core/ui/vaultsOrganisation/folder/CurrentVaultFolderPageProvider'
import { ManageVaultFolderPage } from '@core/ui/vaultsOrganisation/folder/manage/ManageVaultFolderPage'
import { VaultFolderPage } from '@core/ui/vaultsOrganisation/folder/VaultFolderPage'
import { CreateVaultFolderPage } from '@core/ui/vaultsOrganisation/folders/create/CreateVaultFolderPage'
import { Views } from '@lib/ui/navigation/Views'

export type SharedViewId = Extract<
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
  | 'createVaultFolder'
  | 'vaultFolder'
  | 'manageVaultFolder'
>

export const sharedViews: Views<SharedViewId> = {
  address: AddressPage,
  createVaultFolder: CreateVaultFolderPage,
  currencySettings: CurrencyPage,
  defaultChains: DefaultChainsPage,
  importVault: ImportVaultPage,
  languageSettings: LanguagePage,
  manageVaultChains: ManageVaultChainsPage,
  manageVaultChainCoins: ManageVaultChainCoinsPage,
  manageVaultFolder: () => (
    <CurrentVaultFolderPageProvider>
      <ManageVaultFolderPage />
    </CurrentVaultFolderPageProvider>
  ),
  newVault: NewVaultPage,
  renameVault: VaultRenamePage,
  reshareVault: ReshareVaultPage,
  vaultDetails: VaultDetailsPage,
  send: SendPage,
  swap: SwapPage,
  vaultChainDetail: VaultChainPage,
  vaultChainCoinDetail: VaultChainCoinPage,
  vaultFolder: () => (
    <CurrentVaultFolderPageProvider>
      <VaultFolderPage />
    </CurrentVaultFolderPageProvider>
  ),
}
