import { createBrowserRouter } from 'react-router-dom';

import { AddressPage } from './chain/components/address/AddressPage';
import { appPaths } from './navigation';
import { OnboardingPage } from './onboarding/components/OnboardingPage';
import { IncompleteOnboardingOnly } from './onboarding/IncompleteOnboardingOnly';
import EditVaultPage from './pages/edItVault/EditVaultPage';
import VaultBackupPage from './pages/edItVault/vaultBackupSettings/VaultBackupPage';
import DeleteVaultPage from './pages/edItVault/vaultDeleteSettings/DeleteVaultPage';
import VaultDetailsPage from './pages/edItVault/vaultDetailsSettings/VaultDetailsPage';
import VaultRenamePage from './pages/edItVault/vaultRenameSettings/VaultRenamePage';
import ReshareVaultPage from './pages/edItVault/vaultReshareSettings/ReshareVaultPage';
import ImportVaultView from './pages/importVault/ImportVaultView';
import KeysignFlowView from './pages/keysign/KeysignFlow';
import { VaultPage } from './pages/vault/VaultPage';
import SettingsVaultPage from './pages/vaultSettings/SettingsVaultPage';
import AddressBookSettingsPage from './pages/vaultSettings/vaultAddressBook/AddressBookSettingsPage';
import CurrencySettingsPage from './pages/vaultSettings/vaultCurrency/CurrencySettingsPage';
import VaultDefaultChains from './pages/vaultSettings/vaultDefaultChains/VaultDefaultChains';
import FaqVaultPage from './pages/vaultSettings/vaultFaq/FaqVaultPage';
import LanguageSettingsPage from './pages/vaultSettings/vaultLanguage/LanguageSettingsPage';
import { AddVaultPage } from './vault/add/AddVaultPage';
import { VaultChainCoinPage } from './vault/chain/coin/VaultChainCoinPage';
import { ManageVaultChainCoinsPage } from './vault/chain/manage/coin/ManageVaultChainCoinsPage';
import { ManageVaultChainsPage } from './vault/chain/manage/ManageVaultChainsPage';
import { VaultChainPage } from './vault/chain/VaultChainPage';
import { EmptyVaultsOnly } from './vault/components/EmptyVaultsOnly';
import { JoinKeygenPage } from './vault/keygen/join/JoinKeygenPage';
import { JoinKeysignPage } from './vault/keysign/join/JoinKeysignPage';
import { UploadQrPage } from './vault/qr/upload/UploadQrPage';
import { SendPage } from './vault/send/SendPage';
import { SetupVaultOptionsPage } from './vault/setup/options/SetupVaultOptionsPage';
import { SetupVaultPage } from './vault/setup/SetupVaultPage';
import { ShareVaultPage } from './vault/share/ShareVaultPage';

export const router = createBrowserRouter([
  {
    path: appPaths.root,
    element: (
      <EmptyVaultsOnly>
        <IncompleteOnboardingOnly>
          <OnboardingPage />
        </IncompleteOnboardingOnly>
      </EmptyVaultsOnly>
    ),
  },
  {
    path: appPaths.vaultSettings,
    element: <SettingsVaultPage />,
  },
  {
    path: appPaths.addVault,
    element: <AddVaultPage />,
  },
  {
    path: appPaths.setupVaultOptions,
    element: <SetupVaultOptionsPage />,
  },
  {
    path: appPaths.setupVaultInitiatingDevice,
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
    element: <KeysignFlowView />,
  },
  {
    path: appPaths.vaultList,
    element: <VaultPage />,
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
    path: appPaths.vaultReshare,
    element: <ReshareVaultPage />,
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
    element: <VaultDefaultChains />,
  },
  {
    path: appPaths.send,
    element: <SendPage />,
  },
]);
