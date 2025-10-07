import { ExtensionDeveloperOptions } from '@clients/extension/src/components/developer-options'
import { ExpandView } from '@clients/extension/src/components/expand-view'
import { ExpandViewGuard } from '@clients/extension/src/components/expand-view-guard'
import { Prioritize } from '@clients/extension/src/components/prioritize'
import { ReshareFastVault } from '@clients/extension/src/components/settings/reshare/ReshareFastVault'
import { ReshareSecureVault } from '@clients/extension/src/components/settings/reshare/ReshareSecureVault'
import { SetupFastVaultPage } from '@clients/extension/src/components/setup/SetupFastVaultPage'
import { SetupSecureVaultPage } from '@clients/extension/src/components/setup/SetupSecureVaultPage'
import { JoinKeygenPage } from '@clients/extension/src/mpc/keygen/join/JoinKeygenPage'
import { JoinKeysignPage } from '@clients/extension/src/mpc/keysign/join/JoinKeysignPage'
import { AppViewId } from '@clients/extension/src/navigation/AppView'
import { ConnectedDappsPage } from '@clients/extension/src/pages/connected-dapps'
import { SetupVaultPageController } from '@clients/extension/src/pages/setup-vault/SetupVaultPageController'
import { VaultPage } from '@clients/extension/src/pages/vault'
import { StartKeysignView } from '@core/extension/keysign/start/StartKeysignView'
import { SharedViewId, sharedViews } from '@core/ui/navigation/sharedViews'
import { OnboardingPage } from '@core/ui/onboarding/components/OnboardingPage'
import { IncompleteOnboardingOnly } from '@core/ui/onboarding/IncompleteOnboardingOnly'
import { ResponsivenessProvider } from '@core/ui/providers/ResponsivenessProvider'
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
  keysign: StartKeysignView,
  onboarding: () => (
    <IncompleteOnboardingOnly>
      <OnboardingPage />
    </IncompleteOnboardingOnly>
  ),
  reshareVaultFast: ReshareFastVault,
  reshareVaultSecure: ReshareSecureVault,
  settings: () => (
    <SettingsPage
      insiderOptions={<ExtensionDeveloperOptions />}
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
  vault: VaultPage,
}

export const views: Views<AppViewId> = {
  ...sharedViews,
  ...appCustomViews,
}
