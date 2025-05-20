import { SharedViewId, sharedViews } from '@core/ui/navigation/sharedViews'
import { OnboardingPage } from '@core/ui/onboarding/components/OnboardingPage'
import { IncompleteOnboardingOnly } from '@core/ui/onboarding/IncompleteOnboardingOnly'
import { ResponsivenessProvider } from '@core/ui/providers/ResponsivenessProivder'
import { SettingsPage } from '@core/ui/settings'
import { ShareVaultPage } from '@core/ui/vault/share/ShareVaultPage'
import AddressBookSettingsPage from '@core/ui/vault/vaultAddressBook/AddressBookSettingsPage'
import { Views } from '@lib/ui/navigation/Views'

import { CheckUpdate } from '../components/check-update'
import { ManageMpcLib } from '../components/manage-mpc-lib'
import VaultCheckUpdatePage from '../pages/vaultSettings/vaultCheckUpdatePage/VaultCheckUpdatePage'
import FaqVaultPage from '../pages/vaultSettings/vaultFaq/FaqVaultPage'
import { VaultPage } from '../vault/components/VaultPage'
import EditVaultPage from '../vault/edit/EditVaultPage'
import { VaultBackupPage } from '../vault/edit/vaultBackupSettings/VaultBackupPage'
import { ImportVaultFromFilePage } from '../vault/import/components/ImportVaultFromFilePage'
import { JoinKeygenPage } from '../vault/keygen/join/JoinKeygenPage'
import { SignCustomMessagePage } from '../vault/keysign/customMessage/SignCustomMessagePage'
import { JoinKeysignPage } from '../vault/keysign/join/JoinKeysignPage'
import { StartKeysignPage } from '../vault/keysign/start/StartKeysignPage'
import { MigrateVaultPage } from '../vault/migrate/MigrateVaultPage'
import { FastReshareVaultPage } from '../vault/reshare/fast/FastReshareVaultPage'
import { SecureReshareVaultPage } from '../vault/reshare/secure/SecureReshareVaultPage'
import { SetupFastVaultPage } from '../vault/setup/fast/SetupFastVaultPage'
import { SetupSecureVaultPage } from '../vault/setup/secure/SetupSecureVaultPage'
import { SetupVaultPageController } from '../vault/setup/SetupVaultPageController'
import { AppViewId } from './AppView'

const appCustomViews: Views<Exclude<AppViewId, SharedViewId>> = {
  addressBook: AddressBookSettingsPage,
  checkUpdate: VaultCheckUpdatePage,
  faq: FaqVaultPage,
  importVaultFromFile: ImportVaultFromFilePage,
  joinKeygen: JoinKeygenPage,
  joinKeysign: JoinKeysignPage,
  keysign: StartKeysignPage,
  migrateVault: MigrateVaultPage,
  onboarding: () => (
    <IncompleteOnboardingOnly>
      <OnboardingPage />
    </IncompleteOnboardingOnly>
  ),
  reshareVaultFast: FastReshareVaultPage,
  reshareVaultSecure: SecureReshareVaultPage,
  settings: () => (
    <SettingsPage
      client="desktop"
      checkUpdate={<CheckUpdate />}
      manageMpcLib={<ManageMpcLib />}
    />
  ),
  setupFastVault: SetupFastVaultPage,
  setupSecureVault: SetupSecureVaultPage,
  setupVault: () => (
    <ResponsivenessProvider>
      <SetupVaultPageController />
    </ResponsivenessProvider>
  ),
  shareVault: ShareVaultPage,
  signCustomMessage: SignCustomMessagePage,
  vault: VaultPage,
  vaultBackup: VaultBackupPage,
  vaultFAQ: FaqVaultPage,
  vaultSettings: EditVaultPage,
}

export const views: Views<AppViewId> = {
  ...sharedViews,
  ...appCustomViews,
}
