import { ReshareVaultPage } from '@core/ui/mpc/keygen/reshare/ReshareVaultPage'
import { CorePath, corePaths } from '@core/ui/navigation'
import { toEntries } from '@lib/utils/record/toEntries'
import { ReactNode } from 'react'
import { createBrowserRouter, Outlet } from 'react-router-dom'

import { AddressPage } from '../chain/components/address/AddressPage'
import { DeeplinkPage } from '../deeplink/components/DeeplinkPage'
import { ErrorBoundary } from '../errors/components/ErrorBoundary'
import { FullSizeErrorFallback } from '../errors/components/FullSizeErrorFallback'
import { LauncherObserver } from '../launcher/components/LauncherObserver'
import { ManageDklsPage } from '../mpc/dkls/ManageDklsPage'
import { OnboardingPage } from '../onboarding/components/OnboardingPage'
import { IncompleteOnboardingOnly } from '../onboarding/IncompleteOnboardingOnly'
import RegisterForAirdropPage from '../pages/registerForAirdrop/RegisterForAirdropPage'
import SettingsVaultPage from '../pages/vaultSettings/SettingsVaultPage'
import AddressBookSettingsPage from '../pages/vaultSettings/vaultAddressBook/AddressBookSettingsPage'
import VaultCheckUpdatePage from '../pages/vaultSettings/vaultCheckUpdatePage/VaultCheckUpdatePage'
import CurrencySettingsPage from '../pages/vaultSettings/vaultCurrency/CurrencySettingsPage'
import VaultDefaultChainsPage from '../pages/vaultSettings/vaultDefaultChains/VaultDefaultChainsPage'
import FaqVaultPage from '../pages/vaultSettings/vaultFaq/FaqVaultPage'
import LanguageSettingsPage from '../pages/vaultSettings/vaultLanguage/LanguageSettingsPage'
import { VaultChainCoinPage } from '../vault/chain/coin/VaultChainCoinPage'
import { ManageVaultChainCoinsPage } from '../vault/chain/manage/coin/ManageVaultChainCoinsPage'
import { ManageVaultChainsPage } from '../vault/chain/manage/ManageVaultChainsPage'
import { VaultChainPage } from '../vault/chain/VaultChainPage'
import { ActiveVaultGuard } from '../vault/components/ActiveVaultGuard'
import { EmptyVaultsOnly } from '../vault/components/EmptyVaultsOnly'
import { VaultPage } from '../vault/components/VaultPage'
import { DepositPage } from '../vault/deposit/DepositPage'
import EditVaultPage from '../vault/edit/EditVaultPage'
import { VaultBackupPage } from '../vault/edit/vaultBackupSettings/VaultBackupPage'
import DeleteVaultPage from '../vault/edit/vaultDeleteSettings/DeleteVaultPage'
import VaultDetailsPage from '../vault/edit/vaultDetailsSettings/VaultDetailsPage'
import VaultRenamePage from '../vault/edit/vaultRenameSettings/VaultRenamePage'
import { ImportVaultFromFilePage } from '../vault/import/components/ImportVaultFromFilePage'
import { ImportVaultPage } from '../vault/import/components/ImportVaultPage'
import { JoinKeygenPage } from '../vault/keygen/join/JoinKeygenPage'
import { SignCustomMessagePage } from '../vault/keysign/customMessage/SignCustomMessagePage'
import { JoinKeysignPage } from '../vault/keysign/join/JoinKeysignPage'
import { StartKeysignPage } from '../vault/keysign/start/StartKeysignPage'
import { MigrateVaultPage } from '../vault/migrate/MigrateVaultPage'
import { UploadQrPage } from '../vault/qr/upload/UploadQrPage'
import { FastReshareVaultPage } from '../vault/reshare/fast/FastReshareVaultPage'
import { SecureReshareVaultPage } from '../vault/reshare/secure/SecureReshareVaultPage'
import { SendPage } from '../vault/send/SendPage'
import { SetupFastVaultPage } from '../vault/setup/fast/SetupFastVaultPage'
import { SetupSecureVaultPage } from '../vault/setup/secure/SetupSecureVaultPage'
import { SetupVaultPageController } from '../vault/setup/SetupVaultPageController'
import { ShareVaultPage } from '../vault/share/ShareVaultPage'
import { SwapPage } from '../vault/swap/components/SwapPage'
import { NewVaultPage } from '../vaults/components/NewVaultPage'
import { VaultsPage } from '../vaults/components/VaultsPage'
import { CurrentVaultFolderPageProvider } from '../vaults/folder/CurrentVaultFolderPageProvider'
import { ManageVaultFolderPage } from '../vaults/folder/manage/ManageVaultFolderPage'
import { VaultFolderPage } from '../vaults/folder/VaultFolderPage'
import { CreateVaultFolderPage } from '../vaults/folders/create/CreateVaultFolderPage'
import { ManageVaultsPage } from '../vaults/manage/ManageVaultsPage'
import { AppPath, appPaths } from '.'

const Root = () => (
  <ErrorBoundary renderFallback={props => <FullSizeErrorFallback {...props} />}>
    <LauncherObserver />
    <Outlet />
  </ErrorBoundary>
)

const coreRoutes: Record<CorePath, ReactNode> = {
  vault: (
    <ActiveVaultGuard>
      <VaultPage />
    </ActiveVaultGuard>
  ),
  joinKeygen: <JoinKeygenPage />,
  setupFastVault: <SetupFastVaultPage />,
  setupSecureVault: <SetupSecureVaultPage />,
  setupVault: <SetupVaultPageController />,
  importVault: <ImportVaultPage />,
  keysign: (
    <ActiveVaultGuard>
      <StartKeysignPage />
    </ActiveVaultGuard>
  ),
  reshareVault: (
    <ActiveVaultGuard>
      <ReshareVaultPage />
    </ActiveVaultGuard>
  ),
  reshareVaultFast: (
    <ActiveVaultGuard>
      <FastReshareVaultPage />
    </ActiveVaultGuard>
  ),
  reshareVaultSecure: (
    <ActiveVaultGuard>
      <SecureReshareVaultPage />
    </ActiveVaultGuard>
  ),
  joinKeysign: (
    <ActiveVaultGuard>
      <JoinKeysignPage />
    </ActiveVaultGuard>
  ),
  uploadQr: <UploadQrPage />,
  vaults: <VaultsPage />,
}

const appRoutes: Record<AppPath, ReactNode> = {
  root: (
    <EmptyVaultsOnly>
      <NewVaultPage withBackButton={false} />
    </EmptyVaultsOnly>
  ),
  newVault: <NewVaultPage />,
  onboarding: (
    <IncompleteOnboardingOnly>
      <OnboardingPage />
    </IncompleteOnboardingOnly>
  ),
  vaultSettings: <SettingsVaultPage />,
  importVaultFromFile: <ImportVaultFromFilePage />,
  manageVaults: <ManageVaultsPage />,
  manageVaultChains: (
    <ActiveVaultGuard>
      <ManageVaultChainsPage />
    </ActiveVaultGuard>
  ),
  shareVault: (
    <ActiveVaultGuard>
      <ShareVaultPage />
    </ActiveVaultGuard>
  ),
  manageVaultChainCoins: (
    <ActiveVaultGuard>
      <ManageVaultChainCoinsPage />
    </ActiveVaultGuard>
  ),
  vaultChainDetail: (
    <ActiveVaultGuard>
      <VaultChainPage />
    </ActiveVaultGuard>
  ),
  vaultChainCoinDetail: (
    <ActiveVaultGuard>
      <VaultChainCoinPage />
    </ActiveVaultGuard>
  ),
  editVault: (
    <ActiveVaultGuard>
      <EditVaultPage />
    </ActiveVaultGuard>
  ),
  vaultDetails: (
    <ActiveVaultGuard>
      <VaultDetailsPage />
    </ActiveVaultGuard>
  ),
  vaultBackup: (
    <ActiveVaultGuard>
      <VaultBackupPage />
    </ActiveVaultGuard>
  ),
  vaultRename: (
    <ActiveVaultGuard>
      <VaultRenamePage />
    </ActiveVaultGuard>
  ),
  vaultDelete: (
    <ActiveVaultGuard>
      <DeleteVaultPage />
    </ActiveVaultGuard>
  ),
  languageSettings: <LanguageSettingsPage />,
  address: <AddressPage />,
  currencySettings: <CurrencySettingsPage />,
  vaultFAQ: <FaqVaultPage />,
  addressBook: <AddressBookSettingsPage />,
  defaultChains: <VaultDefaultChainsPage />,
  send: (
    <ActiveVaultGuard>
      <SendPage />
    </ActiveVaultGuard>
  ),
  swap: (
    <ActiveVaultGuard>
      <SwapPage />
    </ActiveVaultGuard>
  ),
  migrateVault: (
    <ActiveVaultGuard>
      <MigrateVaultPage />
    </ActiveVaultGuard>
  ),
  registerForAirdrop: (
    <ActiveVaultGuard>
      <RegisterForAirdropPage />
    </ActiveVaultGuard>
  ),
  checkUpdate: <VaultCheckUpdatePage />,
  createVaultFolder: (
    <ActiveVaultGuard>
      <CreateVaultFolderPage />
    </ActiveVaultGuard>
  ),
  vaultFolder: (
    <ActiveVaultGuard>
      <CurrentVaultFolderPageProvider>
        <VaultFolderPage />
      </CurrentVaultFolderPageProvider>
    </ActiveVaultGuard>
  ),
  manageVaultFolder: (
    <ActiveVaultGuard>
      <CurrentVaultFolderPageProvider>
        <ManageVaultFolderPage />
      </CurrentVaultFolderPageProvider>
    </ActiveVaultGuard>
  ),
  deposit: (
    <ActiveVaultGuard>
      <DepositPage />
    </ActiveVaultGuard>
  ),
  deeplink: (
    <ActiveVaultGuard>
      <DeeplinkPage />
    </ActiveVaultGuard>
  ),
  signCustomMessage: <SignCustomMessagePage />,
  dkls: <ManageDklsPage />,
  faq: <FaqVaultPage />,
}

export const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      ...toEntries(coreRoutes).map(({ key, value }) => ({
        path: corePaths[key],
        element: value,
      })),
      ...toEntries(appRoutes).map(({ key, value }) => ({
        path: appPaths[key],
        element: value,
      })),
    ],
  },
])
