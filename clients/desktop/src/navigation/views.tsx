import { CheckUpdate } from '@clients/desktop/src/components/check-update'
import { ManageMpcLib } from '@clients/desktop/src/components/manage-mpc-lib'
import { AppViewId } from '@clients/desktop/src/navigation/AppView'
import { DesktopNotificationPrompt } from '@clients/desktop/src/notifications/DesktopNotificationPrompt'
import { DesktopNotificationSettingsPage } from '@clients/desktop/src/notifications/DesktopNotificationSettingsPage'
import { ImportVaultFromFilePage } from '@clients/desktop/src/vault/import/components/ImportVaultFromFilePage'
import { JoinKeygenPage } from '@clients/desktop/src/vault/keygen/join/JoinKeygenPage'
import { JoinKeysignPage } from '@clients/desktop/src/vault/keysign/join/JoinKeysignPage'
import { StartKeysignPage } from '@clients/desktop/src/vault/keysign/start/StartKeysignPage'
import { MigrateVaultPage } from '@clients/desktop/src/vault/migrate/MigrateVaultPage'
import { FastReshareVaultPage } from '@clients/desktop/src/vault/reshare/fast/FastReshareVaultPage'
import { SecureReshareVaultPage } from '@clients/desktop/src/vault/reshare/secure/SecureReshareVaultPage'
import { SetupFastVaultPage } from '@clients/desktop/src/vault/setup/fast/SetupFastVaultPage'
import { SetupSecureVaultPage } from '@clients/desktop/src/vault/setup/secure/SetupSecureVaultPage'
import { SetupVaultPageController } from '@clients/desktop/src/vault/setup/SetupVaultPageController'
import { SingleKeygenFastPage } from '@clients/desktop/src/vault/singleKeygen/fast/SingleKeygenFastPage'
import { SingleKeygenSecurePage } from '@clients/desktop/src/vault/singleKeygen/secure/SingleKeygenSecurePage'
import { CheckUpdatePage } from '@clients/desktop/src/versioning/CheckUpdatePage'
import { SharedViewId, sharedViews } from '@core/ui/navigation/sharedViews'
import { OnboardingPage } from '@core/ui/onboarding/components/OnboardingPage'
import { IncompleteOnboardingOnly } from '@core/ui/onboarding/IncompleteOnboardingOnly'
import { ResponsivenessProvider } from '@core/ui/providers/ResponsivenessProvider'
import { SettingsPage } from '@core/ui/settings'
import { ImportVaultPage } from '@core/ui/vault/import/components/ImportVaultPage'
import { ImportSeedphrasePage } from '@core/ui/vault/import/seedphrase/ImportSeedphrasePage'
import { VaultPage } from '@core/ui/vault/page'
import { Views } from '@lib/ui/navigation/Views'

const appCustomViews: Views<Exclude<AppViewId, SharedViewId>> = {
  checkUpdate: CheckUpdatePage,
  importSeedphrase: ImportSeedphrasePage,
  importVault: ImportVaultPage,
  importVaultFromFile: ImportVaultFromFilePage,
  joinKeygen: JoinKeygenPage,
  joinKeysign: JoinKeysignPage,
  keysign: StartKeysignPage,
  migrateVault: MigrateVaultPage,
  notificationSettings: DesktopNotificationSettingsPage,
  onboarding: () => (
    <IncompleteOnboardingOnly>
      <OnboardingPage />
    </IncompleteOnboardingOnly>
  ),
  reshareVaultFast: FastReshareVaultPage,
  reshareVaultSecure: SecureReshareVaultPage,
  singleKeygenFast: SingleKeygenFastPage,
  singleKeygenSecure: SingleKeygenSecurePage,
  settings: () => (
    <SettingsPage
      checkUpdate={<CheckUpdate />}
      insiderOptions={<ManageMpcLib />}
    />
  ),
  setupFastVault: SetupFastVaultPage,
  setupSecureVault: SetupSecureVaultPage,
  setupVault: () => (
    <ResponsivenessProvider>
      <SetupVaultPageController />
    </ResponsivenessProvider>
  ),
}

const desktopVaultView: Pick<Views<AppViewId>, 'vault'> = {
  vault: () => (
    <>
      <DesktopNotificationPrompt />
      <VaultPage />
    </>
  ),
}

export const views: Views<AppViewId> = {
  ...sharedViews,
  ...appCustomViews,
  ...desktopVaultView,
}
