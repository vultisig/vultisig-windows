import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OnboardingView from './pages/onboarding/OnboardingView';
import ImportVaultView from './pages/importVault/ImportVaultView';
import './i18n/config';
import SetupVaultView from './pages/setupVault/SetupVaultView';
import VaultItemView from './pages/vault/VaultItemView';
import { InitializedWalletOnly } from './components/wallet/InitializedWalletOnly';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { VaultPage } from './pages/vault/VaultPage';
import SendCryptoView from './pages/send/SendCryptoView';
import { darkTheme } from './lib/ui/theme/darkTheme';
import { UploadQrPage } from './vault/qr/upload/UploadQrPage';
import { ThemeProvider } from './lib/ui/theme/ThemeProvider';
import KeysignFlowView from './pages/keysign/KeysignFlow';

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={darkTheme}>
        <div className="w-full min-h-screen bg-primary h-full flex flex-col">
          <Router>
            <Routes>
              <Route path="/" index element={<OnboardingView />} />
              <Route path="/vault/setup" element={<SetupVaultView />} />
              <Route path="/vault/import" element={<ImportVaultView />} />
              <Route path="/vault/qr/upload" element={<UploadQrPage />} />
              <Route path="/vault/keysign" element={<KeysignFlowView />} />
              <Route
                path="/vault/list"
                element={
                  <InitializedWalletOnly>
                    <VaultPage />
                  </InitializedWalletOnly>
                }
              />
              <Route
                path="/vault/item/detail/:chain"
                element={<VaultItemView />}
              />
              <Route
                path="/vault/item/send/:chain"
                element={<SendCryptoView />}
              />
            </Routes>
          </Router>
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
