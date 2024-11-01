import { createBrowserRouter } from 'react-router-dom';

import { AddressPage } from './chain/components/address/AddressPage';
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
import CurrencySettingsPage from './pages/vaultSettings/vaultCurrency/CurrencySettingsPage';
import VaultDefaultChainsPage from './pages/vaultSettings/vaultDefaultChains/VaultDefaultChainsPage';
import FaqVaultPage from './pages/vaultSettings/vaultFaq/FaqVaultPage';
import LanguageSettingsPage from './pages/vaultSettings/vaultLanguage/LanguageSettingsPage';
import { VaultChainCoinPage } from './vault/chain/coin/VaultChainCoinPage';
import { ManageVaultChainCoinsPage } from './vault/chain/manage/coin/ManageVaultChainCoinsPage';
import { ManageVaultChainsPage } from './vault/chain/manage/ManageVaultChainsPage';
import { VaultChainPage } from './vault/chain/VaultChainPage';
import { EmptyVaultsOnly } from './vault/components/EmptyVaultsOnly';
import { VaultPage } from './vault/components/VaultPage';
import { JoinKeygenPage } from './vault/keygen/join/JoinKeygenPage';
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
    path: appPaths.joinKeysign,
    element: <JoinKeysignPage />,
  },
  {
    path: appPaths.keysign,
    element: <StartKeysignPage />,
  },
  {
    path: appPaths.fastKeysign,
    element: <StartFastKeysignPage />,
  },
  {
    path: appPaths.vault,
    element: <VaultPage />,
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
    element: <ManageVaultChainsPage />,
  },
  {
    path: appPaths.shareVault,
    element: <ShareVaultPage />,
  },
  {
    path: appPaths.manageVaultChainCoins,
    element: <ManageVaultChainCoinsPage />,
  },
  {
    path: appPaths.vaultChainDetail,
    element: <VaultChainPage />,
  },
  {
    path: appPaths.vaultChainCoinDetail,
    element: <VaultChainCoinPage />,
  },
  {
    path: appPaths.editVault,
    element: <EditVaultPage />,
  },
  {
    path: appPaths.vaultDetails,
    element: <VaultDetailsPage />,
  },
  {
    path: appPaths.vaultBackup,
    element: <VaultBackupPage />,
  },
  {
    path: appPaths.vaultRename,
    element: <VaultRenamePage />,
  },
  {
    path: appPaths.reshareVault,
    element: <ReshareVaultPage />,
  },
  {
    path: appPaths.reshareVaultFast,
    element: <FastReshareVaultPage />,
  },
  {
    path: appPaths.reshareVaultSecure,
    element: <SecureReshareVaultPage />,
  },
  {
    path: appPaths.vaultDelete,
    element: <DeleteVaultPage />,
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
    element: <SendPage />,
  },
  {
    path: appPaths.vaultItemSwap,
    element: <SwapPage />,
  },
  {
    path: appPaths.reshareVault,
    element: <ReshareVaultPage />,
  },
  {
    path: appPaths.registerForAirdrop,
    element: <RegisterForAirdropPage />,
  },
]);
