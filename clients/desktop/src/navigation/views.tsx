import { SharedViewId, sharedViews } from '@core/ui/navigation/sharedViews'
import { OnboardingPage } from '@core/ui/onboarding/components/OnboardingPage'
import { IncompleteOnboardingOnly } from '@core/ui/onboarding/IncompleteOnboardingOnly'
import { ResponsivenessProvider } from '@core/ui/providers/ResponsivenessProivder'
import { SettingsPage } from '@core/ui/settings'
import { ImportVaultPage } from '@core/ui/vault/import/components/ImportVaultPage'
import { ShareVaultPage } from '@core/ui/vault/share/ShareVaultPage'
import { Views } from '@lib/ui/navigation/Views'

import { CheckUpdate } from '../components/check-update'
import { ManageMpcLib } from '../components/manage-mpc-lib'
import FaqVaultPage from '../pages/vaultSettings/vaultFaq/FaqVaultPage'
import { VaultPage } from '../vault/components/VaultPage'
import { ImportVaultFromFilePage } from '../vault/import/components/ImportVaultFromFilePage'
import { JoinKeygenPage } from '../vault/keygen/join/JoinKeygenPage'
import { JoinKeysignPage } from '../vault/keysign/join/JoinKeysignPage'
import { StartKeysignPage } from '../vault/keysign/start/StartKeysignPage'
import { MigrateVaultPage } from '../vault/migrate/MigrateVaultPage'
import { FastReshareVaultPage } from '../vault/reshare/fast/FastReshareVaultPage'
import { SecureReshareVaultPage } from '../vault/reshare/secure/SecureReshareVaultPage'
import { SetupFastVaultPage } from '../vault/setup/fast/SetupFastVaultPage'
import { SetupSecureVaultPage } from '../vault/setup/secure/SetupSecureVaultPage'
import { SetupVaultPageController } from '../vault/setup/SetupVaultPageController'
import { CheckUpdatePage } from '../versioning/CheckUpdatePage'
import { AppViewId } from './AppView'

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
  vault: VaultPage,
  vaultFAQ: FaqVaultPage,
}

export const views: Views<AppViewId> = {
  ...sharedViews,
  ...appCustomViews,
}
