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
import { SharedViewId, sharedViews } from '@core/ui/navigation/sharedViews'
import { IncompleteOnboardingOnly } from '@core/ui/onboarding/IncompleteOnboardingOnly'
import { VaultsPage } from '@core/ui/vaultsOrganisation/components/VaultsPage'
import { ManageVaultsPage } from '@core/ui/vaultsOrganisation/manage/ManageVaultsPage'
import { Views } from '@lib/ui/navigation/Views'

const appCustomViews: Views<Exclude<AppViewId, SharedViewId>> = {
  vault: VaultPage,
  joinKeygen: () => <>TODO: Implement join keygen page</>,
  setupFastVault: SetupFastVaultPage,
  setupSecureVault: SetupSecureVaultPage,
  setupVault: SetupVaultPageController,
  importVault: ImportFilePage,
  keysign: () => <>TODO: Implement keysign page</>,
  reshareVaultFast: ReshareFastVault,
  reshareVaultSecure: ReshareSecureVault,
  joinKeysign: () => <>TODO: Implement join keysign page</>,
  uploadQr: ImportQRPage,
  vaults: VaultsPage,
  deposit: () => <>{/* <>TODO: Implement Deposit page</> */}</>,
  vaultSettings: VaultSettingsPage,
  settings: SettingsPage,
  connectedDapps: ConnectedDappsPage,
  onboarding: () => (
    <IncompleteOnboardingOnly>
      <OnboardingPage />
    </IncompleteOnboardingOnly>
  ),
  connectTab: ConnectDAppPage,
  vaultsTab: GetVaultsPage,
  transactionTab: TransactionPage,
  manageVaults: ManageVaultsPage,
}

export const views: Views<AppViewId> = {
  ...sharedViews,
  ...appCustomViews,
}
