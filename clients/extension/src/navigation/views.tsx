import { OnboardingPage } from '@clients/extension/src/components/onboarding/components/OnboardingPage'
import { Prioritize } from '@clients/extension/src/components/prioritize'
import { ReshareFastVault } from '@clients/extension/src/components/settings/reshare/ReshareFastVault'
import { ReshareSecureVault } from '@clients/extension/src/components/settings/reshare/ReshareSecureVault'
import { SetupFastVaultPage } from '@clients/extension/src/components/setup/SetupFastVaultPage'
import { SetupSecureVaultPage } from '@clients/extension/src/components/setup/SetupSecureVaultPage'
import { JoinKeygenPage } from '@clients/extension/src/mpc/keygen/join/JoinKeygenPage'
import { JoinKeysignPage } from '@clients/extension/src/mpc/keysign/join/JoinKeysignPage'
import { StartKeysignPage } from '@clients/extension/src/mpc/keysign/start/StartKeysignPage'
import { AppViewId } from '@clients/extension/src/navigation/AppView'
import { ConnectDAppPage } from '@clients/extension/src/pages/connect-dapp'
import { ConnectedDappsPage } from '@clients/extension/src/pages/connected-dapps'
import { GetVaultsPage } from '@clients/extension/src/pages/get-vaults'
import { SetupVaultPageController } from '@clients/extension/src/pages/setup-vault/SetupVaultPageController'
import { TransactionPage } from '@clients/extension/src/pages/transaction'
import { VaultPage } from '@clients/extension/src/pages/vault'
import { VaultSettingsPage } from '@clients/extension/src/pages/vault-settings'
import { SharedViewId, sharedViews } from '@core/ui/navigation/sharedViews'
import { IncompleteOnboardingOnly } from '@core/ui/onboarding/IncompleteOnboardingOnly'
import { SettingsPage } from '@core/ui/settings'
import AddressBookSettingsPage from '@core/ui/vault/vaultAddressBook/AddressBookSettingsPage'
import { VaultsPage } from '@core/ui/vaultsOrganisation/components/VaultsPage'
import { ManageVaultsPage } from '@core/ui/vaultsOrganisation/manage/ManageVaultsPage'
import { Views } from '@lib/ui/navigation/Views'

const appCustomViews: Views<Exclude<AppViewId, SharedViewId>> = {
  addressBook: AddressBookSettingsPage,
  connectedDapps: ConnectedDappsPage,
  connectTab: ConnectDAppPage,
  joinKeygen: JoinKeygenPage,
  joinKeysign: JoinKeysignPage,
  keysign: StartKeysignPage,
  manageVaults: ManageVaultsPage,
  onboarding: () => (
    <IncompleteOnboardingOnly>
      <OnboardingPage />
    </IncompleteOnboardingOnly>
  ),
  reshareVaultFast: ReshareFastVault,
  reshareVaultSecure: ReshareSecureVault,
  settings: () => <SettingsPage prioritize={<Prioritize />} />,
  setupFastVault: SetupFastVaultPage,
  setupSecureVault: SetupSecureVaultPage,
  setupVault: SetupVaultPageController,
  transactionTab: TransactionPage,
  vault: VaultPage,
  vaults: VaultsPage,
  vaultSettings: VaultSettingsPage,
  vaultsTab: GetVaultsPage,
}

export const views: Views<AppViewId> = {
  ...sharedViews,
  ...appCustomViews,
}
