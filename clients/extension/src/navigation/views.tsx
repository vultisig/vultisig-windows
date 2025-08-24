import { ExpandView } from '@clients/extension/src/components/expand-view'
import { ExpandViewGuard } from '@clients/extension/src/components/expand-view-guard'
import { Prioritize } from '@clients/extension/src/components/prioritize'
import { ReshareFastVault } from '@clients/extension/src/components/settings/reshare/ReshareFastVault'
import { ReshareSecureVault } from '@clients/extension/src/components/settings/reshare/ReshareSecureVault'
import { SetupFastVaultPage } from '@clients/extension/src/components/setup/SetupFastVaultPage'
import { SetupSecureVaultPage } from '@clients/extension/src/components/setup/SetupSecureVaultPage'
import { JoinKeygenPage } from '@clients/extension/src/mpc/keygen/join/JoinKeygenPage'
import { JoinKeysignPage } from '@clients/extension/src/mpc/keysign/join/JoinKeysignPage'
import { StartKeysignPage } from '@clients/extension/src/mpc/keysign/start/StartKeysignPage'
import { AppViewId } from '@clients/extension/src/navigation/AppView'
import { ConnectedDappsPage } from '@clients/extension/src/pages/connected-dapps'
import { SetupVaultPageController } from '@clients/extension/src/pages/setup-vault/SetupVaultPageController'
import { TransactionPage } from '@clients/extension/src/pages/transaction'
import { VaultPage } from '@clients/extension/src/pages/vault'
import { SharedViewId, sharedViews } from '@core/ui/navigation/sharedViews'
import { OnboardingPage } from '@core/ui/onboarding/components/OnboardingPage'
import { IncompleteOnboardingOnly } from '@core/ui/onboarding/IncompleteOnboardingOnly'
import { ResponsivenessProvider } from '@core/ui/providers/ResponsivenessProivder'
import { SettingsPage } from '@core/ui/settings'
import { ImportVaultPage } from '@core/ui/vault/import/components/ImportVaultPage'
import { Views } from '@lib/ui/navigation/Views'

const appCustomViews: Views<Exclude<AppViewId, SharedViewId>> = {
  connectedDapps: ConnectedDappsPage,
  importVault: () => (
    <ExpandViewGuard>
      <ImportVaultPage />
    </ExpandViewGuard>
  ),
  joinKeygen: JoinKeygenPage,
  joinKeysign: JoinKeysignPage,
  keysign: StartKeysignPage,
  onboarding: () => (
    <IncompleteOnboardingOnly>
      <OnboardingPage />
    </IncompleteOnboardingOnly>
  ),
  reshareVaultFast: ReshareFastVault,
  reshareVaultSecure: ReshareSecureVault,
  settings: () => (
    <SettingsPage
      client="extension"
      prioritize={<Prioritize />}
      expandView={<ExpandView />}
    />
  ),
  setupFastVault: SetupFastVaultPage,
  setupSecureVault: SetupSecureVaultPage,
  setupVault: () => (
    <ExpandViewGuard>
      <ResponsivenessProvider>
        <SetupVaultPageController />
      </ResponsivenessProvider>
    </ExpandViewGuard>
  ),
  transactionTab: TransactionPage,
  vault: VaultPage,
}

export const views: Views<AppViewId> = {
  ...sharedViews,
  ...appCustomViews,
}
