import { CorePath } from '@core/ui/navigation'
import { sharedRoutes } from '@core/ui/navigation/routes'
import { IncompleteOnboardingOnly } from '@core/ui/onboarding/IncompleteOnboardingOnly'
import { ActiveVaultGuard } from '@core/ui/vault/ActiveVaultGuard'
import { Routes } from '@lib/ui/navigation/state'

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
import { VaultsPage } from '../vaults/components/VaultsPage'
import { CurrentVaultFolderPageProvider } from '../vaults/folder/CurrentVaultFolderPageProvider'
import { ManageVaultFolderPage } from '../vaults/folder/manage/ManageVaultFolderPage'
import { VaultFolderPage } from '../vaults/folder/VaultFolderPage'
import { CreateVaultFolderPage } from '../vaults/folders/create/CreateVaultFolderPage'
import { ManageVaultsPage } from '../vaults/manage/ManageVaultsPage'
import { AppPath } from '.'

const coreRoutes: Routes<CorePath> = {
  ...sharedRoutes,
  vault: () => (
    <ActiveVaultGuard>
      <VaultPage />
    </ActiveVaultGuard>
  ),
  joinKeygen: () => <JoinKeygenPage />,
  setupFastVault: () => <SetupFastVaultPage />,
  setupSecureVault: () => <SetupSecureVaultPage />,
  setupVault: () => <SetupVaultPageController />,
  importVault: () => <ImportVaultPage />,
  keysign: () => (
    <ActiveVaultGuard>
      <StartKeysignPage />
    </ActiveVaultGuard>
  ),
  reshareVaultFast: () => (
    <ActiveVaultGuard>
      <FastReshareVaultPage />
    </ActiveVaultGuard>
  ),
  reshareVaultSecure: () => (
    <ActiveVaultGuard>
      <SecureReshareVaultPage />
    </ActiveVaultGuard>
  ),
  joinKeysign: () => (
    <ActiveVaultGuard>
      <JoinKeysignPage />
    </ActiveVaultGuard>
  ),
  uploadQr: () => <UploadQrPage />,
  vaults: () => <VaultsPage />,
  deposit: () => (
    <ActiveVaultGuard>
      <DepositPage />
    </ActiveVaultGuard>
  ),
}

const appRoutes: Routes<AppPath> = {
  onboarding: () => (
    <IncompleteOnboardingOnly>
      <OnboardingPage />
    </IncompleteOnboardingOnly>
  ),
  vaultSettings: () => <SettingsVaultPage />,
  importVaultFromFile: () => <ImportVaultFromFilePage />,
  manageVaults: () => <ManageVaultsPage />,
  shareVault: () => (
    <ActiveVaultGuard>
      <ShareVaultPage />
    </ActiveVaultGuard>
  ),
  editVault: () => (
    <ActiveVaultGuard>
      <EditVaultPage />
    </ActiveVaultGuard>
  ),
  vaultBackup: () => (
    <ActiveVaultGuard>
      <VaultBackupPage />
    </ActiveVaultGuard>
  ),
  vaultDelete: () => (
    <ActiveVaultGuard>
      <DeleteVaultPage />
    </ActiveVaultGuard>
  ),
  vaultFAQ: () => <FaqVaultPage />,
  addressBook: () => <AddressBookSettingsPage />,
  migrateVault: () => (
    <ActiveVaultGuard>
      <MigrateVaultPage />
    </ActiveVaultGuard>
  ),
  registerForAirdrop: () => (
    <ActiveVaultGuard>
      <RegisterForAirdropPage />
    </ActiveVaultGuard>
  ),
  checkUpdate: () => <VaultCheckUpdatePage />,
  createVaultFolder: () => (
    <ActiveVaultGuard>
      <CreateVaultFolderPage />
    </ActiveVaultGuard>
  ),
  vaultFolder: () => (
    <ActiveVaultGuard>
      <CurrentVaultFolderPageProvider>
        <VaultFolderPage />
      </CurrentVaultFolderPageProvider>
    </ActiveVaultGuard>
  ),
  manageVaultFolder: () => (
    <ActiveVaultGuard>
      <CurrentVaultFolderPageProvider>
        <ManageVaultFolderPage />
      </CurrentVaultFolderPageProvider>
    </ActiveVaultGuard>
  ),
  deeplink: () => (
    <ActiveVaultGuard>
      <DeeplinkPage />
    </ActiveVaultGuard>
  ),
  signCustomMessage: () => (
    <ActiveVaultGuard>
      <SignCustomMessagePage />
    </ActiveVaultGuard>
  ),
  dkls: () => <ManageDklsPage />,
  faq: () => <FaqVaultPage />,
}

export const routes = {
  ...coreRoutes,
  ...appRoutes,
}
