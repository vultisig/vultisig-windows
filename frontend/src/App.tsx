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

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="w-full min-h-screen bg-primary">
        <Router>
          <Routes>
            <Route path="/" index element={<OnboardingView />} />
            <Route path="/vault/setup" element={<SetupVaultView />} />
            <Route path="/vault/import" element={<ImportVaultView />} />
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
          </Routes>
        </Router>
      </div>
    </QueryClientProvider>
  );
};

export default App;
