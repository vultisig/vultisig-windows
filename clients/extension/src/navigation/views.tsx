import { AppViewId } from '@clients/extension/src/navigation/AppView'
import {
  SharedViewId,
  sharedViewLoaders,
} from '@core/ui/navigation/sharedViews'
import { NewVaultPage } from '@core/ui/vault/new'
import { lazyViews } from '@lib/ui/navigation/lazyViews'
import { ViewLoaders } from '@lib/ui/navigation/ViewLoaders'
import { Views } from '@lib/ui/navigation/Views'
import { omit } from '@vultisig/lib-utils/record/omit'

import { ExtensionChooseVaultsView } from '../components/notifications/ExtensionChooseVaultsView'
import { ExtensionVaultPage } from './views/ExtensionVaultPage'

type StaticViewId = 'vault' | 'newVault' | 'chooseVaults' | 'migrateVault'

const appCustomViewLoaders: ViewLoaders<
  Exclude<AppViewId, SharedViewId | 'migrateVault'>
> = {
  connectedDapps: () =>
    import('@clients/extension/src/pages/connected-dapps').then(
      ({ ConnectedDappsPage }) => ConnectedDappsPage
    ),
  importSeedphrase: () =>
    import('@core/ui/vault/import/seedphrase/ImportSeedphrasePage').then(
      ({ ImportSeedphrasePage }) => ImportSeedphrasePage
    ),
  importVault: () =>
    import('./views/ImportVaultView').then(
      ({ ImportVaultView }) => ImportVaultView
    ),
  joinKeygen: () =>
    import('@clients/extension/src/mpc/keygen/join/JoinKeygenPage').then(
      ({ JoinKeygenPage }) => JoinKeygenPage
    ),
  joinKeysign: () =>
    import('@clients/extension/src/mpc/keysign/join/JoinKeysignPage').then(
      ({ JoinKeysignPage }) => JoinKeysignPage
    ),
  keysign: () =>
    import('@core/extension/keysign/start/StartKeysignView').then(
      ({ StartKeysignView }) => StartKeysignView
    ),
  notificationSettings: () =>
    import('../components/notifications/ExtensionNotificationSettingsPage').then(
      ({ ExtensionNotificationSettingsPage }) =>
        ExtensionNotificationSettingsPage
    ),
  onboarding: () =>
    import('./views/OnboardingView').then(
      ({ OnboardingView }) => OnboardingView
    ),
  reshareVaultFast: () =>
    import('@clients/extension/src/components/settings/reshare/ReshareFastVault').then(
      ({ ReshareFastVault }) => ReshareFastVault
    ),
  reshareVaultSecure: () =>
    import('@clients/extension/src/components/settings/reshare/ReshareSecureVault').then(
      ({ ReshareSecureVault }) => ReshareSecureVault
    ),
  singleKeygenFast: () =>
    import('@clients/extension/src/components/settings/singleKeygen/SingleKeygenFastVault').then(
      ({ SingleKeygenFastVault }) => SingleKeygenFastVault
    ),
  singleKeygenSecure: () =>
    import('@clients/extension/src/components/settings/singleKeygen/SingleKeygenSecureVault').then(
      ({ SingleKeygenSecureVault }) => SingleKeygenSecureVault
    ),
  settings: () =>
    import('./views/ExtensionSettingsView').then(
      ({ ExtensionSettingsView }) => ExtensionSettingsView
    ),
  setupFastVault: () =>
    import('@clients/extension/src/components/setup/SetupFastVaultPage').then(
      ({ SetupFastVaultPage }) => SetupFastVaultPage
    ),
  setupSecureVault: () =>
    import('@clients/extension/src/components/setup/SetupSecureVaultPage').then(
      ({ SetupSecureVaultPage }) => SetupSecureVaultPage
    ),
  setupVault: () =>
    import('./views/SetupVaultView').then(
      ({ SetupVaultView }) => SetupVaultView
    ),
  stationMigration: () =>
    import('./views/StationMigrationView').then(
      ({ StationMigrationView }) => StationMigrationView
    ),
}

/**
 * Views that ship in the entry chunk: the home screens the action popup must
 * paint immediately, plus a view with nothing to load.
 */
const staticViews: Pick<Views<AppViewId>, StaticViewId> = {
  vault: ExtensionVaultPage,
  newVault: NewVaultPage,
  chooseVaults: ExtensionChooseVaultsView,
  migrateVault: () => null,
}

const lazy = lazyViews({ ...sharedViewLoaders, ...appCustomViewLoaders })

export const views: Views<AppViewId> = {
  ...lazy.views,
  ...staticViews,
}

/** Loaders for every view outside the entry chunk, to warm once home has painted. */
export const viewLoaders = omit(
  lazy.loaders,
  'vault',
  'newVault',
  'chooseVaults'
)

/** The views a user is most likely to open next from home, warmed first. */
export const viewPrefetchPriority: (keyof typeof viewLoaders)[] = [
  'send',
  'swap',
  'vaultChainDetail',
  'defi',
  'settings',
]
