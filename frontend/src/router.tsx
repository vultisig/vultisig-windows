import { createBrowserRouter, Outlet } from 'react-router-dom';

import { AddressPage } from './chain/components/address/AddressPage';
import { DeeplinkPage } from './deeplink/components/DeeplinkPage';
import { ErrorBoundary } from './errors/components/ErrorBoundary';
import { FullSizeErrorFallback } from './errors/components/FullSizeErrorFallback';
import { LauncherObserver } from './launcher/components/LauncherObserver';
import { appPaths } from './navigation';
import { OnboardingPage } from './onboarding/components/OnboardingPage';
import { IncompleteOnboardingOnly } from './onboarding/IncompleteOnboardingOnly';
import EditVaultPage from './pages/edItVault/EditVaultPage';
import VaultBackupPage from './pages/edItVault/vaultBackupSettings/VaultBackupPage';
import DeleteVaultPage from './pages/edItVault/vaultDeleteSettings/DeleteVaultPage';
import VaultDetailsPage from './pages/edItVault/vaultDetailsSettings/VaultDetailsPage';
import VaultRenamePage from './pages/edItVault/vaultRenameSettings/VaultRenamePage';
import RegisterForAirdropPage from './pages/registerForAirdrop/RegisterForAirdropPage';
import SettingsVaultPage from './pages/vaultSettings/SettingsVaultPage';
import AddressBookSettingsPage from './pages/vaultSettings/vaultAddressBook/AddressBookSettingsPage';
import VaultCheckUpdatePage from './pages/vaultSettings/vaultCheckUpdatePage/VaultCheckUpdatePage';
import CurrencySettingsPage from './pages/vaultSettings/vaultCurrency/CurrencySettingsPage';
import VaultDefaultChainsPage from './pages/vaultSettings/vaultDefaultChains/VaultDefaultChainsPage';
import FaqVaultPage from './pages/vaultSettings/vaultFaq/FaqVaultPage';
import LanguageSettingsPage from './pages/vaultSettings/vaultLanguage/LanguageSettingsPage';
import { VaultChainCoinPage } from './vault/chain/coin/VaultChainCoinPage';
import { ManageVaultChainCoinsPage } from './vault/chain/manage/coin/ManageVaultChainCoinsPage';
import { ManageVaultChainsPage } from './vault/chain/manage/ManageVaultChainsPage';
import { VaultChainPage } from './vault/chain/VaultChainPage';
import { ActiveVaultGuard } from './vault/components/ActiveVaultGuard';
import { EmptyVaultsOnly } from './vault/components/EmptyVaultsOnly';
import { VaultPage } from './vault/components/VaultPage';
import { DepositPage } from './vault/deposit/DepositPage';
import { ImportVaultFromFilePage } from './vault/import/components/ImportVaultFromFilePage';
import { ImportVaultPage } from './vault/import/components/ImportVaultPage';
import { JoinKeygenPage } from './vault/keygen/join/JoinKeygenPage';
import { SignCustomMessagePage } from './vault/keysign/customMessage/SignCustomMessagePage';
import { JoinKeysignPage } from './vault/keysign/join/JoinKeysignPage';
import { StartFastKeysignPage } from './vault/keysign/start/fast/StartFastKeysignPage';
import { StartKeysignPage } from './vault/keysign/start/StartKeysignPage';
import { UploadQrPage } from './vault/qr/upload/UploadQrPage';
import { FastReshareVaultPage } from './vault/reshare/fast/FastReshareVaultPage';
import { ReshareVaultPage } from './vault/reshare/ReshareVaultPage';
import { SecureReshareVaultPage } from './vault/reshare/secure/SecureReshareVaultPage';
import { SendPage } from './vault/send/SendPage';
import { SetupFastVaultPage } from './vault/setup/fast/SetupFastVaultPage';
import { SetupSecureVaultPage } from './vault/setup/secure/SetupSecureVaultPage';
import { SetupVaultPageController } from './vault/setup/SetupVaultPageController';
import { ShareVaultPage } from './vault/share/ShareVaultPage';
import { SwapPage } from './vault/swap/components/SwapPage';
import { NoVaultsHomePage } from './vaults/components/NoVaultsHomePage';
import { VaultsPage } from './vaults/components/VaultsPage';
import { CurrentVaultFolderPageProvider } from './vaults/folder/CurrentVaultFolderPageProvider';
import { ManageVaultFolderPage } from './vaults/folder/manage/ManageVaultFolderPage';
import { VaultFolderPage } from './vaults/folder/VaultFolderPage';
import { CreateVaultFolderPage } from './vaults/folders/create/CreateVaultFolderPage';
import { ManageVaultsPage } from './vaults/manage/ManageVaultsPage';

const Root = () => (
  <ErrorBoundary renderFallback={props => <FullSizeErrorFallback {...props} />}>
    <LauncherObserver />
    <Outlet />
  </ErrorBoundary>
);

export const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      {
        path: appPaths.root,
        element: (
          <EmptyVaultsOnly>
            <NoVaultsHomePage />
          </EmptyVaultsOnly>
        ),
      },
      {
        path: appPaths.onboarding,
        element: (
          <IncompleteOnboardingOnly>
            <OnboardingPage />
          </IncompleteOnboardingOnly>
        ),
      },
      {
        path: appPaths.vaultSettings,
        element: <SettingsVaultPage />,
      },
      {
        path: appPaths.setupFastVault,
        element: <SetupFastVaultPage />,
      },
      {
        path: appPaths.setupSecureVault,
        element: <SetupSecureVaultPage />,
      },
      {
        path: appPaths.setupVault,
        element: <SetupVaultPageController />,
      },
      {
        path: appPaths.importVault,
        element: <ImportVaultPage />,
      },
      {
        path: appPaths.importVaultFromFile,
        element: <ImportVaultFromFilePage />,
      },
      {
        path: appPaths.uploadQr,
        element: <UploadQrPage />,
      },
      {
        path: appPaths.joinKeygen,
        element: <JoinKeygenPage />,
      },
      {
        path: appPaths.joinKeysign,
        element: (
          <ActiveVaultGuard>
            <JoinKeysignPage />
          </ActiveVaultGuard>
        ),
      },
      {
        path: appPaths.keysign,
        element: (
          <ActiveVaultGuard>
            <StartKeysignPage />
          </ActiveVaultGuard>
        ),
      },
      {
        path: appPaths.fastKeysign,
        element: (
          <ActiveVaultGuard>
            <StartFastKeysignPage />
          </ActiveVaultGuard>
        ),
      },
      {
        path: appPaths.vault,
        element: (
          <ActiveVaultGuard>
            <VaultPage />
          </ActiveVaultGuard>
        ),
      },
      {
        path: appPaths.vaults,
        element: <VaultsPage />,
      },
      {
        path: appPaths.manageVaults,
        element: <ManageVaultsPage />,
      },
      {
        path: appPaths.manageVaultChains,
        element: (
          <ActiveVaultGuard>
            <ManageVaultChainsPage />
          </ActiveVaultGuard>
        ),
      },
      {
        path: appPaths.shareVault,
        element: (
          <ActiveVaultGuard>
            <ShareVaultPage />
          </ActiveVaultGuard>
        ),
      },
      {
        path: appPaths.manageVaultChainCoins,
        element: (
          <ActiveVaultGuard>
            <ManageVaultChainCoinsPage />
          </ActiveVaultGuard>
        ),
      },
      {
        path: appPaths.vaultChainDetail,
        element: (
          <ActiveVaultGuard>
            <VaultChainPage />
          </ActiveVaultGuard>
        ),
      },
      {
        path: appPaths.vaultChainCoinDetail,
        element: (
          <ActiveVaultGuard>
            <VaultChainCoinPage />
          </ActiveVaultGuard>
        ),
      },
      {
        path: appPaths.editVault,
        element: (
          <ActiveVaultGuard>
            <EditVaultPage />
          </ActiveVaultGuard>
        ),
      },
      {
        path: appPaths.vaultDetails,
        element: (
          <ActiveVaultGuard>
            <VaultDetailsPage />
          </ActiveVaultGuard>
        ),
      },
      {
        path: appPaths.vaultBackup,
        element: (
          <ActiveVaultGuard>
            <VaultBackupPage />
          </ActiveVaultGuard>
        ),
      },
      {
        path: appPaths.vaultRename,
        element: (
          <ActiveVaultGuard>
            <VaultRenamePage />
          </ActiveVaultGuard>
        ),
      },
      {
        path: appPaths.reshareVault,
        element: (
          <ActiveVaultGuard>
            <ReshareVaultPage />
          </ActiveVaultGuard>
        ),
      },
      {
        path: appPaths.reshareVaultFast,
        element: (
          <ActiveVaultGuard>
            <FastReshareVaultPage />
          </ActiveVaultGuard>
        ),
      },
      {
        path: appPaths.reshareVaultSecure,
        element: (
          <ActiveVaultGuard>
            <SecureReshareVaultPage />
          </ActiveVaultGuard>
        ),
      },
      {
        path: appPaths.vaultDelete,
        element: (
          <ActiveVaultGuard>
            <DeleteVaultPage />
          </ActiveVaultGuard>
        ),
      },
      {
        path: appPaths.languageSettings,
        element: <LanguageSettingsPage />,
      },
      {
        path: appPaths.address,
        element: <AddressPage />,
      },
      {
        path: appPaths.currencySettings,
        element: <CurrencySettingsPage />,
      },
      {
        path: appPaths.vaultFAQ,
        element: <FaqVaultPage />,
      },
      {
        path: appPaths.addressBook,
        element: <AddressBookSettingsPage />,
      },
      {
        path: appPaths.defaultChains,
        element: <VaultDefaultChainsPage />,
      },
      {
        path: appPaths.send,
        element: (
          <ActiveVaultGuard>
            <SendPage />
          </ActiveVaultGuard>
        ),
      },
      {
        path: appPaths.swap,
        element: (
          <ActiveVaultGuard>
            <SwapPage />
          </ActiveVaultGuard>
        ),
      },
      {
        path: appPaths.reshareVault,
        element: (
          <ActiveVaultGuard>
            <ReshareVaultPage />
          </ActiveVaultGuard>
        ),
      },
      {
        path: appPaths.registerForAirdrop,
        element: (
          <ActiveVaultGuard>
            <RegisterForAirdropPage />
          </ActiveVaultGuard>
        ),
      },
      {
        path: appPaths.checkUpdate,
        element: <VaultCheckUpdatePage />,
      },
      {
        path: appPaths.createVaultFolder,
        element: (
          <ActiveVaultGuard>
            <CreateVaultFolderPage />
          </ActiveVaultGuard>
        ),
      },
      {
        path: appPaths.vaultFolder,
        element: (
          <ActiveVaultGuard>
            <CurrentVaultFolderPageProvider>
              <VaultFolderPage />
            </CurrentVaultFolderPageProvider>
          </ActiveVaultGuard>
        ),
      },
      {
        path: appPaths.manageVaultFolder,
        element: (
          <ActiveVaultGuard>
            <CurrentVaultFolderPageProvider>
              <ManageVaultFolderPage />
            </CurrentVaultFolderPageProvider>
          </ActiveVaultGuard>
        ),
      },
      {
        path: appPaths.deposit,
        element: (
          <ActiveVaultGuard>
            <DepositPage />
          </ActiveVaultGuard>
        ),
      },
      {
        path: appPaths.deeplink,
        element: (
          <ActiveVaultGuard>
            <DeeplinkPage />
          </ActiveVaultGuard>
        ),
      },
      {
        path: appPaths.signCustomMessage,
        element: <SignCustomMessagePage />,
      },
    ],
  },
]);
