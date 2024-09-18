import { createBrowserRouter } from 'react-router-dom';

import { AddressPage } from './chain/components/address/AddressPage';
import VerifyTransaction from './components/sendCrypto/VerifyTransaction';
import {
  addressPath,
  addVaultPath,
  importVaultPath,
  joinKeysignPath,
  keysignPath,
  setupVaultPath,
  shareVaultPath,
} from './navigation';
import { OnboardingPage } from './onboarding/components/OnboardingPage';
import { IncompleteOnboardingOnly } from './onboarding/IncompleteOnboardingOnly';
import EditVaultPage from './pages/edItVault/EditVaultPage';
import VaultBackupPage from './pages/edItVault/vaultBackup/VaultBackupPage';
import DeleteVaultPage from './pages/edItVault/vaultDelete/DeleteVaultPage';
import VaultDetailsPage from './pages/edItVault/vaultDetails/VaultDetailsPage';
import VaultRenamePage from './pages/edItVault/vaultRename/VaultRenamePage';
import ReshareVaultPage from './pages/edItVault/vaultReshare/ReshareVaultPage';
import ImportVaultView from './pages/importVault/ImportVaultView';
import JoinKeygenView from './pages/keygen/JoinKeygenView';
import JoinKeysignFlow from './pages/keysign/JoinKeysignFlow';
import KeysignFlowView from './pages/keysign/KeysignFlow';
import SendCryptoView from './pages/send/SendCryptoView';
import SetupVaultView from './pages/setupVault/SetupVaultView';
import { VaultPage } from './pages/vault/VaultPage';
import SettingsVaultPage from './pages/vaultSettings/SettingsVaultPage';
import LanguageSettingsPage from './pages/vaultSettings/vaultLanguage/LanguageSettingsPage';
import { AddVaultPage } from './vault/add/AddVaultPage';
import { VaultChainCoinPage } from './vault/chain/coin/VaultChainCoinPage';
import { ManageVaultChainCoinsPage } from './vault/chain/manage/coin/ManageVaultChainCoinsPage';
import { ManageVaultChainsPage } from './vault/chain/manage/ManageVaultChainsPage';
import { VaultChainPage } from './vault/chain/VaultChainPage';
import { EmptyVaultsOnly } from './vault/components/EmptyVaultsOnly';
import { UploadQrPage } from './vault/qr/upload/UploadQrPage';
import { ShareVaultPage } from './vault/share/ShareVaultPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <EmptyVaultsOnly>
        <IncompleteOnboardingOnly>
          <OnboardingPage />
        </IncompleteOnboardingOnly>
      </EmptyVaultsOnly>
    ),
  },
  {
    path: '/vault/settings',
    element: <SettingsVaultPage />,
  },
  {
    path: addVaultPath,
    element: <AddVaultPage />,
  },
  {
    path: setupVaultPath,
    element: <SetupVaultView />,
  },
  {
    path: importVaultPath,
    element: <ImportVaultView />,
  },
  {
    path: '/vault/qr/upload',
    element: <UploadQrPage />,
  },
  {
    path: '/join-keygen/:keygenType/:sessionID',
    element: <JoinKeygenView />,
  },
  {
    path: joinKeysignPath,
    element: <JoinKeysignFlow />,
  },
  {
    path: keysignPath,
    element: <KeysignFlowView />,
  },
  {
    path: '/vault/list',
    element: <VaultPage />,
  },
  {
    path: '/vault/chains',
    element: <ManageVaultChainsPage />,
  },
  {
    path: shareVaultPath,
    element: <ShareVaultPage />,
  },
  {
    path: '/vault/chains/:chain',
    element: <ManageVaultChainCoinsPage />,
  },
  {
    path: '/vault/item/detail/:chain',
    element: <VaultChainPage />,
  },
  {
    path: '/vault/item/detail/:chain/:coin',
    element: <VaultChainCoinPage />,
  },
  {
    path: '/vault/item/send/:chain',
    element: <SendCryptoView />,
  },
  {
    path: '/vault/item/send/verify',
    element: <VerifyTransaction />,
  },
  {
    path: '/vault/settings/vault-settings',
    element: <EditVaultPage />,
  },
  {
    path: '/vault/settings/vault-settings/details',
    element: <VaultDetailsPage />,
  },
  {
    path: '/vault/settings/vault-settings/backup-vault',
    element: <VaultBackupPage />,
  },
  {
    path: '/vault/settings/vault-settings/rename-vault',
    element: <VaultRenamePage />,
  },
  {
    path: '/vault/settings/vault-settings/reshare-vault',
    element: <ReshareVaultPage />,
  },
  {
    path: '/vault/settings/vault-settings/delete-vault',
    element: <DeleteVaultPage />,
  },
  {
    path: '/vault/settings/language-settings',
    element: <LanguageSettingsPage />,
  },
  { path: addressPath, element: <AddressPage /> },
]);
