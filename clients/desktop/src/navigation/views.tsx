import { CheckUpdate } from '@clients/desktop/src/components/check-update'
import { ManageMpcLib } from '@clients/desktop/src/components/manage-mpc-lib'
import { AppViewId } from '@clients/desktop/src/navigation/AppView'
import { FaqVaultPage } from '@clients/desktop/src/pages/vaultSettings/vaultFaq/FaqVaultPage'
import { VaultPage } from '@clients/desktop/src/vault/components/VaultPage'
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
import { CheckUpdatePage } from '@clients/desktop/src/versioning/CheckUpdatePage'
import { SharedViewId, sharedViews } from '@core/ui/navigation/sharedViews'
import { OnboardingPage } from '@core/ui/onboarding/components/OnboardingPage'
import { IncompleteOnboardingOnly } from '@core/ui/onboarding/IncompleteOnboardingOnly'
import { ResponsivenessProvider } from '@core/ui/providers/ResponsivenessProvider'
import { SettingsPage } from '@core/ui/settings'
import { ImportVaultPage } from '@core/ui/vault/import/components/ImportVaultPage'
import { ShareVaultPage } from '@core/ui/vault/share/ShareVaultPage'
import { Views } from '@lib/ui/navigation/Views'

const appCustomViews: Views<Exclude<AppViewId, SharedViewId>> = {
  checkUpdate: CheckUpdatePage,
  faq: FaqVaultPage,
  importVault: ImportVaultPage,
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
  shareVault: ShareVaultPage,
  vault: VaultPage,
  vaultFAQ: FaqVaultPage,
}

export const views: Views<AppViewId> = {
  ...sharedViews,
  ...appCustomViews,
}
