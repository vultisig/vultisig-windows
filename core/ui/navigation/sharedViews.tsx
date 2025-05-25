import { AddressPage } from '@core/ui/chain/coin/address'
import { DeeplinkPage } from '@core/ui/deeplink/components/DeeplinkPage'
import { ReshareVaultPage } from '@core/ui/mpc/keygen/reshare/ReshareVaultPage'
import { CoreViewId } from '@core/ui/navigation/CoreView'
import { CurrencyPage } from '@core/ui/preferences/currency'
import { LanguagePage } from '@core/ui/preferences/language'
import { UploadQrPage } from '@core/ui/qr/upload/UploadQrPage'
import { VaultChainCoinPage } from '@core/ui/vault/chain/coin/VaultChainCoinPage'
import { ManageVaultChainsPage } from '@core/ui/vault/chain/manage'
import { ManageVaultChainCoinsPage } from '@core/ui/vault/chain/manage/coin'
import { VaultChainPage } from '@core/ui/vault/chain/VaultChainPage'
import { DepositPage } from '@core/ui/vault/deposit/DepositPage'
import { ImportVaultPage } from '@core/ui/vault/import/components/ImportVaultPage'
import { NewVaultPage } from '@core/ui/vault/new'
import { SendPage } from '@core/ui/vault/send/SendPage'
import { AirdropRegisterPage } from '@core/ui/vault/settings/airdrop-register'
import { DeleteVaultPage } from '@core/ui/vault/settings/delete'
import { VaultDetailsPage } from '@core/ui/vault/settings/details'
import { VaultRenamePage } from '@core/ui/vault/settings/rename'
import { SwapPage } from '@core/ui/vault/swap/components/SwapPage'
import { VaultsPage } from '@core/ui/vaultsOrganisation'
import { VaultFolderPage } from '@core/ui/vaultsOrganisation/folder'
import { CreateVaultFolderPage } from '@core/ui/vaultsOrganisation/folder/create'
import { CurrentVaultFolderPageProvider } from '@core/ui/vaultsOrganisation/folder/provider'
import { UpdateVaultFolderPage } from '@core/ui/vaultsOrganisation/folder/update'
import { ManageVaultsPage } from '@core/ui/vaultsOrganisation/manage'
import { Views } from '@lib/ui/navigation/Views'

import { AddCustomTokenPage } from '../chain/coin/addCustomToken/AddCustomTokenPage'

export type SharedViewId = Extract<
  CoreViewId,
  | 'address'
  | 'airdropRegister'
  | 'createVaultFolder'
  | 'currencySettings'
  | 'deeplink'
  | 'deleteVault'
  | 'deposit'
  | 'importVault'
  | 'languageSettings'
  | 'manageVaultChainCoins'
  | 'manageVaultChains'
  | 'manageVaultFolder'
  | 'manageVaults'
  | 'newVault'
  | 'renameVault'
  | 'reshareVault'
  | 'send'
  | 'swap'
  | 'updateVaultFolder'
  | 'uploadQr'
  | 'vaultChainDetail'
  | 'vaultChainCoinDetail'
  | 'vaultFolder'
  | 'vaultDetails'
  | 'vaults'
  | 'manageVaultFolder'
  | 'addCustomToken'
>

export const sharedViews: Views<SharedViewId> = {
  address: AddressPage,
  airdropRegister: AirdropRegisterPage,
  createVaultFolder: CreateVaultFolderPage,
  currencySettings: CurrencyPage,
  deeplink: DeeplinkPage,
  deleteVault: DeleteVaultPage,
  deposit: DepositPage,
  importVault: ImportVaultPage,
  languageSettings: LanguagePage,
  manageVaultChains: ManageVaultChainsPage,
  manageVaultChainCoins: ManageVaultChainCoinsPage,
  manageVaults: ManageVaultsPage,
  newVault: NewVaultPage,
  renameVault: VaultRenamePage,
  reshareVault: ReshareVaultPage,
  send: SendPage,
  swap: SwapPage,
  updateVaultFolder: () => (
    <CurrentVaultFolderPageProvider>
      <UpdateVaultFolderPage />
    </CurrentVaultFolderPageProvider>
  ),
  uploadQr: UploadQrPage,
  vaultChainDetail: VaultChainPage,
  vaultChainCoinDetail: VaultChainCoinPage,
  vaultDetails: VaultDetailsPage,
  vaultFolder: () => (
    <CurrentVaultFolderPageProvider>
      <VaultFolderPage />
    </CurrentVaultFolderPageProvider>
  ),
  vaults: VaultsPage,
  addCustomToken: AddCustomTokenPage,
}
