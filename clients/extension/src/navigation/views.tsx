import { OnboardingPage } from '@clients/extension/src/components/onboarding/components/OnboardingPage'
import { ReshareFastVault } from '@clients/extension/src/components/settings/reshare/ReshareFastVault'
import { ReshareSecureVault } from '@clients/extension/src/components/settings/reshare/ReshareSecureVault'
import { SetupFastVaultPage } from '@clients/extension/src/components/setup/SetupFastVaultPage'
import { SetupSecureVaultPage } from '@clients/extension/src/components/setup/SetupSecureVaultPage'
import { AppViewId } from '@clients/extension/src/navigation/AppView'
import { ConnectDAppPage } from '@clients/extension/src/pages/connect-dapp'
import { ConnectedDappsPage } from '@clients/extension/src/pages/connected-dapps'
import { GetVaultsPage } from '@clients/extension/src/pages/get-vaults'
import ImportFilePage from '@clients/extension/src/pages/import-file'
import ImportQRPage from '@clients/extension/src/pages/import-qr'
import { SettingsPage } from '@clients/extension/src/pages/settings'
import { SetupVaultPageController } from '@clients/extension/src/pages/setup-vault/SetupVaultPageController'
import { TransactionPage } from '@clients/extension/src/pages/transaction'
import { VaultPage } from '@clients/extension/src/pages/vault'
import { VaultSettingsPage } from '@clients/extension/src/pages/vault-settings'
import { VaultsPage } from '@clients/extension/src/pages/vaults'
import { sharedViews } from '@core/ui/navigation/sharedViews'
import { IncompleteOnboardingOnly } from '@core/ui/onboarding/IncompleteOnboardingOnly'
import { ActiveVaultGuard } from '@core/ui/vault/ActiveVaultGuard'
import { Views } from '@lib/ui/navigation/Views'

export const views: Views<AppViewId> = {
  ...sharedViews,
  vault: () => (
    <ActiveVaultGuard>
      <VaultPage />
    </ActiveVaultGuard>
  ),
  joinKeygen: () => <>TODO: Implement join keygen page</>,
  setupFastVault: () => <SetupFastVaultPage />,
  setupSecureVault: () => <SetupSecureVaultPage />,
  setupVault: () => <SetupVaultPageController />,
  importVault: () => <ImportFilePage />,
  keysign: () => (
    <ActiveVaultGuard>TODO: Implement keysign page</ActiveVaultGuard>
  ),
  reshareVaultFast: () => (
    <ActiveVaultGuard>
      <ReshareFastVault />
    </ActiveVaultGuard>
  ),
  reshareVaultSecure: () => (
    <ActiveVaultGuard>
      <ReshareSecureVault />
    </ActiveVaultGuard>
  ),
  joinKeysign: () => (
    <ActiveVaultGuard>TODO: Implement join keysign page</ActiveVaultGuard>
  ),
  uploadQr: () => <ImportQRPage />,
  vaults: () => (
    <ActiveVaultGuard>
      <VaultsPage />
    </ActiveVaultGuard>
  ),
  deposit: () => (
    <ActiveVaultGuard>
      <>{/* <>TODO: Implement Deposit page</> */}</>
    </ActiveVaultGuard>
  ),
  vaultSettings: () => (
    <ActiveVaultGuard>
      <VaultSettingsPage />
    </ActiveVaultGuard>
  ),
  settings: () => <SettingsPage />,
  connectedDapps: () => (
    <ActiveVaultGuard>
      <ConnectedDappsPage />
    </ActiveVaultGuard>
  ),
  onboarding: () => (
    <IncompleteOnboardingOnly>
      <OnboardingPage />
    </IncompleteOnboardingOnly>
  ),
  connectTab: () => <ConnectDAppPage />,
  vaultsTab: () => <GetVaultsPage />,
  transactionTab: () => <TransactionPage />,
}
