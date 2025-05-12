import { sharedViews } from '@core/ui/navigation/sharedViews'
import { VaultsPage } from '@core/ui/vaultsOrganisation/components/VaultsPage'
import { CurrentVaultFolderPageProvider } from '@core/ui/vaultsOrganisation/folder/CurrentVaultFolderPageProvider'
import { ManageVaultFolderPage } from '@core/ui/vaultsOrganisation/folder/manage/ManageVaultFolderPage'
import { VaultFolderPage } from '@core/ui/vaultsOrganisation/folder/VaultFolderPage'
import { CreateVaultFolderPage } from '@core/ui/vaultsOrganisation/folders/create/CreateVaultFolderPage'
import { ManageVaultsPage } from '@core/ui/vaultsOrganisation/manage/ManageVaultsPage'
import { Views } from '@lib/ui/navigation/Views'

import { DeeplinkPage } from '../deeplink/components/DeeplinkPage'
import { ManageDklsPage } from '../mpc/dkls/ManageDklsPage'
import { OnboardingPage } from '../onboarding/components/OnboardingPage'
import RegisterForAirdropPage from '../pages/registerForAirdrop/RegisterForAirdropPage'
import SettingsVaultPage from '../pages/vaultSettings/SettingsVaultPage'
import AddressBookSettingsPage from '../pages/vaultSettings/vaultAddressBook/AddressBookSettingsPage'
import VaultCheckUpdatePage from '../pages/vaultSettings/vaultCheckUpdatePage/VaultCheckUpdatePage'
import FaqVaultPage from '../pages/vaultSettings/vaultFaq/FaqVaultPage'
import { VaultPage } from '../vault/components/VaultPage'
import { DepositPage } from '../vault/deposit/DepositPage'
import EditVaultPage from '../vault/edit/EditVaultPage'
import { VaultBackupPage } from '../vault/edit/vaultBackupSettings/VaultBackupPage'
import DeleteVaultPage from '../vault/edit/vaultDeleteSettings/DeleteVaultPage'
import { ImportVaultFromFilePage } from '../vault/import/components/ImportVaultFromFilePage'
import { ImportVaultPage } from '../vault/import/components/ImportVaultPage'
import { JoinKeygenPage } from '../vault/keygen/join/JoinKeygenPage'
import { SignCustomMessagePage } from '../vault/keysign/customMessage/SignCustomMessagePage'
import { JoinKeysignPage } from '../vault/keysign/join/JoinKeysignPage'
import { StartKeysignPage } from '../vault/keysign/start/StartKeysignPage'
import { MigrateVaultPage } from '../vault/migrate/MigrateVaultPage'
import { UploadQrPage } from '../vault/qr/upload/UploadQrPage'
import { FastReshareVaultPage } from '../vault/reshare/fast/FastReshareVaultPage'
import { SecureReshareVaultPage } from '../vault/reshare/secure/SecureReshareVaultPage'
import { SetupFastVaultPage } from '../vault/setup/fast/SetupFastVaultPage'
import { SetupSecureVaultPage } from '../vault/setup/secure/SetupSecureVaultPage'
import { SetupVaultPageController } from '../vault/setup/SetupVaultPageController'
import { ShareVaultPage } from '../vault/share/ShareVaultPage'
import { AppViewId } from './AppView'

export const views: Views<AppViewId> = {
  ...sharedViews,
  vault: VaultPage,
  joinKeygen: JoinKeygenPage,
  setupFastVault: SetupFastVaultPage,
  setupSecureVault: SetupSecureVaultPage,
  setupVault: SetupVaultPageController,
  importVault: ImportVaultPage,
  keysign: StartKeysignPage,
  reshareVaultFast: FastReshareVaultPage,
  reshareVaultSecure: SecureReshareVaultPage,
  joinKeysign: JoinKeysignPage,
  uploadQr: UploadQrPage,
  vaults: VaultsPage,
  deposit: DepositPage,
  onboarding: OnboardingPage,
  vaultSettings: SettingsVaultPage,
  importVaultFromFile: ImportVaultFromFilePage,
  manageVaults: ManageVaultsPage,
  shareVault: ShareVaultPage,
  editVault: EditVaultPage,
  vaultBackup: VaultBackupPage,
  vaultDelete: DeleteVaultPage,
  vaultFAQ: FaqVaultPage,
  addressBook: AddressBookSettingsPage,
  migrateVault: MigrateVaultPage,
  registerForAirdrop: RegisterForAirdropPage,
  checkUpdate: VaultCheckUpdatePage,
  createVaultFolder: CreateVaultFolderPage,
  vaultFolder: () => (
    <CurrentVaultFolderPageProvider>
      <VaultFolderPage />
    </CurrentVaultFolderPageProvider>
  ),
  manageVaultFolder: () => (
    <CurrentVaultFolderPageProvider>
      <ManageVaultFolderPage />
    </CurrentVaultFolderPageProvider>
  ),
  deeplink: DeeplinkPage,
  signCustomMessage: SignCustomMessagePage,
  dkls: ManageDklsPage,
  faq: FaqVaultPage,
}
