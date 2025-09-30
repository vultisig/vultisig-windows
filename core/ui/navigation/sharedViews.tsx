import { AddressBookPage } from '@core/ui/address-book'
import { CreateAddressBookItemPage } from '@core/ui/address-book/create'
import { UpdateAddressBookItemPage } from '@core/ui/address-book/update'
import { AddCustomTokenPage } from '@core/ui/chain/coin/addCustomToken/AddCustomTokenPage'
import { AddressPage } from '@core/ui/chain/coin/address'
import { DeeplinkPage } from '@core/ui/deeplink/components/DeeplinkPage'
import { ReshareVaultPage } from '@core/ui/mpc/keygen/reshare/ReshareVaultPage'
import { CoreViewId } from '@core/ui/navigation/CoreView'
import { CurrencyPage } from '@core/ui/preferences/currency'
import { LanguagePage } from '@core/ui/preferences/language'
import { UploadQrPage } from '@core/ui/qr/upload'
import { VaultBackupPage } from '@core/ui/vault/backup'
import { VaultChainCoinPage } from '@core/ui/vault/chain/coin/VaultChainCoinPage'
import { ManageVaultChainsPage } from '@core/ui/vault/chain/manage'
import { ManageVaultChainCoinsPage } from '@core/ui/vault/chain/manage/coin'
import { VaultChainPage } from '@core/ui/vault/chain/VaultChainPage'
import { DepositPage } from '@core/ui/vault/deposit/DepositPage'
import { SignCustomMessagePage } from '@core/ui/vault/keysign/custom-message'
import { NewVaultPage } from '@core/ui/vault/new'
import { SendPage } from '@core/ui/vault/send/SendPage'
import { VaultSettingsPage } from '@core/ui/vault/settings'
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

import { PasscodeAutoLockPage } from '../passcodeEncryption/autoLock/PasscodeAutoLockPage'
import { ManagePasscodeEncryptionPage } from '../passcodeEncryption/manage/ManagePasscodeEncryptionPage'
import { DepositActionProvider } from '../vault/deposit/providers/DepositActionProvider'
import { DepositCoinProvider } from '../vault/deposit/providers/DepositCoinProvider'
import { ReferralsGuard } from '../vault/settings/referral/providers/ReferralsGuard'
import { ReferralPage } from '../vault/settings/referral/ReferralsPage'

export type SharedViewId = Extract<
  CoreViewId,
  | 'addCustomToken'
  | 'address'
  | 'addressBook'
  | 'airdropRegister'
  | 'createAddressBookItem'
  | 'createVaultFolder'
  | 'currencySettings'
  | 'deeplink'
  | 'deleteVault'
  | 'deposit'
  | 'languageSettings'
  | 'manageVaultChainCoins'
  | 'manageVaultChains'
  | 'manageVaultFolder'
  | 'manageVaults'
  | 'newVault'
  | 'renameVault'
  | 'reshareVault'
  | 'send'
  | 'signCustomMessage'
  | 'swap'
  | 'updateAddressBookItem'
  | 'updateVaultFolder'
  | 'uploadQr'
  | 'vaultBackup'
  | 'vaultChainDetail'
  | 'vaultChainCoinDetail'
  | 'vaultDetails'
  | 'vaultFolder'
  | 'vaultSettings'
  | 'vaults'
  | 'managePasscodeEncryption'
  | 'passcodeAutoLock'
  | 'referral'
>

export const sharedViews: Views<SharedViewId> = {
  referral: () => (
    <ReferralsGuard>
      <ReferralPage />
    </ReferralsGuard>
  ),
  addCustomToken: AddCustomTokenPage,
  address: AddressPage,
  addressBook: AddressBookPage,
  airdropRegister: AirdropRegisterPage,
  createAddressBookItem: CreateAddressBookItemPage,
  createVaultFolder: CreateVaultFolderPage,
  currencySettings: CurrencyPage,
  deeplink: DeeplinkPage,
  deleteVault: DeleteVaultPage,
  deposit: () => (
    <DepositActionProvider>
      <DepositCoinProvider>
        <DepositPage />
      </DepositCoinProvider>
    </DepositActionProvider>
  ),
  languageSettings: LanguagePage,
  manageVaultChains: ManageVaultChainsPage,
  manageVaultChainCoins: ManageVaultChainCoinsPage,
  manageVaults: ManageVaultsPage,
  newVault: NewVaultPage,
  renameVault: VaultRenamePage,
  reshareVault: ReshareVaultPage,
  send: SendPage,
  signCustomMessage: SignCustomMessagePage,
  swap: SwapPage,
  updateAddressBookItem: UpdateAddressBookItemPage,
  updateVaultFolder: () => (
    <CurrentVaultFolderPageProvider>
      <UpdateVaultFolderPage />
    </CurrentVaultFolderPageProvider>
  ),
  uploadQr: UploadQrPage,
  vaultBackup: VaultBackupPage,
  vaultChainCoinDetail: VaultChainCoinPage,
  vaultChainDetail: VaultChainPage,
  vaultDetails: VaultDetailsPage,
  vaultFolder: () => (
    <CurrentVaultFolderPageProvider>
      <VaultFolderPage />
    </CurrentVaultFolderPageProvider>
  ),
  vaultSettings: VaultSettingsPage,
  vaults: VaultsPage,
  managePasscodeEncryption: ManagePasscodeEncryptionPage,
  passcodeAutoLock: PasscodeAutoLockPage,
}
