import { AddressPage } from '@core/ui/chain/coin/address'
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
import { AirdropRegisterPage } from '@core/ui/vault/settings/airdrop-register'
import { DeleteVaultPage } from '@core/ui/vault/settings/delete'
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
  | 'airdropRegister'
  | 'currencySettings'
  | 'defaultChains'
  | 'importVault'
  | 'deleteVault'
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
  airdropRegister: AirdropRegisterPage,
  createVaultFolder: CreateVaultFolderPage,
  currencySettings: CurrencyPage,
  defaultChains: DefaultChainsPage,
  deleteVault: DeleteVaultPage,
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
  send: SendPage,
  swap: SwapPage,
  vaultChainDetail: VaultChainPage,
  vaultChainCoinDetail: VaultChainCoinPage,
  vaultDetails: VaultDetailsPage,
  vaultFolder: () => (
    <CurrentVaultFolderPageProvider>
      <VaultFolderPage />
    </CurrentVaultFolderPageProvider>
  ),
}
