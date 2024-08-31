import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OnboardingView from './pages/onboarding/OnboardingView';
import ImportVaultView from './pages/importVault/ImportVaultView';
import './i18n/config';
import SetupVaultView from './pages/setupVault/SetupVaultView';
import { InitializedWalletOnly } from './components/wallet/InitializedWalletOnly';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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

const queryClient = new QueryClient();

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
                  <Route path="/vault/keysign" element={<KeysignFlowView />} />
                  <Route path="/vault/list" element={<VaultPage />} />
                  <Route
                    path="/vault/item/detail/:chain"
                    element={<VaultChainPage />}
                  />
                  <Route
                    path="/vault/item/send/:chain"
                    element={<SendCryptoView />}
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
