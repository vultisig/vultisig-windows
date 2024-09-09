import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OnboardingView from './pages/onboarding/OnboardingView';
import ImportVaultView from './pages/importVault/ImportVaultView';
import './i18n/config';
import SetupVaultView from './pages/setupVault/SetupVaultView';
import { InitializedWalletOnly } from './components/wallet/InitializedWalletOnly';
import { QueryClientProvider } from '@tanstack/react-query';
import SendCryptoView from './pages/send/SendCryptoView';
import { darkTheme } from './lib/ui/theme/darkTheme';
import { UploadQrPage } from './vault/qr/upload/UploadQrPage';
import { ThemeProvider } from './lib/ui/theme/ThemeProvider';
import KeysignFlowView from './pages/keysign/KeysignFlow';
import { GlobalStyle } from './lib/ui/css/GlobalStyle';
import { VaultsDependant } from './vault/components/VaultsDependant';
import { VaultPage } from './pages/vault/VaultPage';
import { EmptyVaultsOnly } from './vault/components/EmptyVaultsOnly';
import { VaultChainPage } from './vault/chain/VaultChainPage';
import VerifyTransaction from './components/sendCrypto/VerifyTransaction';
import { ManageVaultChainsPage } from './vault/chain/manage/ManageVaultChainsPage';
import { getQueryClient } from './query/queryClient';
import { ManageVaultChainCoinsPage } from './vault/chain/manage/coin/ManageVaultChainCoinsPage';
import JoinKeygenView from './pages/keygen/JoinKeygenView';

const queryClient = getQueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={darkTheme}>
        <GlobalStyle />
        <div className="w-full min-h-screen bg-primary h-full flex flex-col">
          <VaultsDependant>
            <InitializedWalletOnly>
              <Router>
                <Routes>
                  <Route
                    path="/"
                    index
                    element={
                      <EmptyVaultsOnly>
                        <OnboardingView />
                      </EmptyVaultsOnly>
                    }
                  />
                  <Route path="/vault/setup" element={<SetupVaultView />} />
                  <Route path="/vault/import" element={<ImportVaultView />} />
                  <Route path="/vault/qr/upload" element={<UploadQrPage />} />
                  <Route
                    path="/join-keygen/:keygenType"
                    element={<JoinKeygenView />}
                  />
                  <Route path="/vault/keysign" element={<KeysignFlowView />} />
                  <Route path="/vault/list" element={<VaultPage />} />
                  <Route
                    path="/vault/chains"
                    element={<ManageVaultChainsPage />}
                  />
                  <Route
                    path="/vault/chains/:chain"
                    element={<ManageVaultChainCoinsPage />}
                  />
                  <Route
                    path="/vault/item/detail/:chain"
                    element={<VaultChainPage />}
                  />
                  <Route
                    path="/vault/item/send/:chain"
                    element={<SendCryptoView />}
                  />

                  <Route
                    path="/vault/item/send/verify"
                    element={<VerifyTransaction />}
                  />
                </Routes>
              </Router>
            </InitializedWalletOnly>
          </VaultsDependant>
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
