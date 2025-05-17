import { SharedViewId, sharedViews } from '@core/ui/navigation/sharedViews'
import { IncompleteOnboardingOnly } from '@core/ui/onboarding/IncompleteOnboardingOnly'
import { SettingsPage } from '@core/ui/settings'
import { ShareVaultPage } from '@core/ui/vault/share/ShareVaultPage'
import AddressBookSettingsPage from '@core/ui/vault/vaultAddressBook/AddressBookSettingsPage'
import { VaultsPage } from '@core/ui/vaultsOrganisation/components/VaultsPage'
import { ManageVaultsPage } from '@core/ui/vaultsOrganisation/manage/ManageVaultsPage'
import { Views } from '@lib/ui/navigation/Views'

import { CheckUpdate } from '../components/check-update'
import { DeeplinkPage } from '../deeplink/components/DeeplinkPage'
import { ManageDklsPage } from '../mpc/dkls/ManageDklsPage'
import { OnboardingPage } from '../onboarding/components/OnboardingPage'
import VaultCheckUpdatePage from '../pages/vaultSettings/vaultCheckUpdatePage/VaultCheckUpdatePage'
import FaqVaultPage from '../pages/vaultSettings/vaultFaq/FaqVaultPage'
import { VaultPage } from '../vault/components/VaultPage'
import { DepositPage } from '../vault/deposit/DepositPage'
import EditVaultPage from '../vault/edit/EditVaultPage'
import { VaultBackupPage } from '../vault/edit/vaultBackupSettings/VaultBackupPage'
import { ImportVaultFromFilePage } from '../vault/import/components/ImportVaultFromFilePage'
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
import { AppViewId } from './AppView'

const appCustomViews: Views<Exclude<AppViewId, SharedViewId>> = {
  addressBook: AddressBookSettingsPage,
  checkUpdate: VaultCheckUpdatePage,
  deeplink: DeeplinkPage,
  deposit: DepositPage,
  dkls: ManageDklsPage,
  faq: FaqVaultPage,
  importVaultFromFile: ImportVaultFromFilePage,
  joinKeygen: JoinKeygenPage,
  joinKeysign: JoinKeysignPage,
  keysign: StartKeysignPage,
  manageVaults: ManageVaultsPage,
  migrateVault: MigrateVaultPage,
  onboarding: () => (
    <IncompleteOnboardingOnly>
      <OnboardingPage />
    </IncompleteOnboardingOnly>
  ),
  reshareVaultFast: FastReshareVaultPage,
  reshareVaultSecure: SecureReshareVaultPage,
  settings: () => <SettingsPage checkUpdate={<CheckUpdate />} />,
  setupFastVault: SetupFastVaultPage,
  setupSecureVault: SetupSecureVaultPage,
  setupVault: SetupVaultPageController,
  shareVault: ShareVaultPage,
  signCustomMessage: SignCustomMessagePage,
  uploadQr: UploadQrPage,
  vault: VaultPage,
  vaultBackup: VaultBackupPage,
  vaultFAQ: FaqVaultPage,
  vaults: VaultsPage,
  vaultSettings: EditVaultPage,
}

export const views: Views<AppViewId> = {
  ...sharedViews,
  ...appCustomViews,
}
