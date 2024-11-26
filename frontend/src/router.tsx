import { createBrowserRouter } from 'react-router-dom';

import { AddressPage } from './chain/components/address/AddressPage';
import { DeeplinkPage } from './deeplink/components/DeeplinkPage';
import { appPaths } from './navigation';
import { CompletedOnboardingOnly } from './onboarding/CompletedOnboardingOnly';
import { OnboardingPage } from './onboarding/components/OnboardingPage';
import { IncompleteOnboardingOnly } from './onboarding/IncompleteOnboardingOnly';
import EditVaultPage from './pages/edItVault/EditVaultPage';
import VaultBackupPage from './pages/edItVault/vaultBackupSettings/VaultBackupPage';
import DeleteVaultPage from './pages/edItVault/vaultDeleteSettings/DeleteVaultPage';
import VaultDetailsPage from './pages/edItVault/vaultDetailsSettings/VaultDetailsPage';
import VaultRenamePage from './pages/edItVault/vaultRenameSettings/VaultRenamePage';
import ImportVaultView from './pages/importVault/ImportVaultView';
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
import { JoinKeygenPage } from './vault/keygen/join/JoinKeygenPage';
import { KeygenBackup } from './vault/keygen/shared/KeygenBackup';
import { JoinKeysignPage } from './vault/keysign/join/JoinKeysignPage';
import { StartFastKeysignPage } from './vault/keysign/start/fast/StartFastKeysignPage';
import { StartKeysignPage } from './vault/keysign/start/StartKeysignPage';
import { UploadQrPage } from './vault/qr/upload/UploadQrPage';
import { FastReshareVaultPage } from './vault/reshare/fast/FastReshareVaultPage';
import { ReshareVaultPage } from './vault/reshare/ReshareVaultPage';
import { SecureReshareVaultPage } from './vault/reshare/secure/SecureReshareVaultPage';
import { SendPage } from './vault/send/SendPage';
import { SetupActiveVaultPage } from './vault/setup/active/SetupActiveVaultPage';
import { SetupFastVaultPage } from './vault/setup/fast/SetupFastVaultPage';
import { SetupSecureVaultPage } from './vault/setup/secure/SetupSecureVaultPage';
import { SetupVaultPage } from './vault/setup/type/SetupVaultPage';
import { ShareVaultPage } from './vault/share/ShareVaultPage';
import { SwapPage } from './vault/swap/SwapPage';
import { NoVaultsHomePage } from './vaults/components/NoVaultsHomePage';
import { VaultsPage } from './vaults/components/VaultsPage';
import { CurrentVaultFolderPageProvider } from './vaults/folder/CurrentVaultFolderPageProvider';
import { ManageVaultFolderPage } from './vaults/folder/manage/ManageVaultFolderPage';
import { VaultFolderPage } from './vaults/folder/VaultFolderPage';
import { CreateVaultFolderPage } from './vaults/folders/create/CreateVaultFolderPage';
import { ManageVaultsPage } from './vaults/manage/ManageVaultsPage';

export const router = createBrowserRouter([
  {
    path: appPaths.root,
    element: (
      <EmptyVaultsOnly>
        <CompletedOnboardingOnly>
          <NoVaultsHomePage />
        </CompletedOnboardingOnly>
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
    path: appPaths.setupActiveVault,
    element: <SetupActiveVaultPage />,
  },
  {
    path: appPaths.setupSecureVault,
    element: <SetupSecureVaultPage />,
  },
  {
    path: appPaths.setupVault,
    element: <SetupVaultPage />,
  },
  {
    path: appPaths.importVault,
    element: <ImportVaultView />,
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
    path: appPaths.keygenBackup,
    element: <KeygenBackup />,
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
    path: appPaths.vaultItemSwap,
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
    path: appPaths.vaultItemDeposit,
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
]);
