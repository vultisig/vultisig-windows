import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OnboardingView from './pages/onboarding/OnboardingView';
import ImportVaultView from './pages/importVault/ImportVaultView';
import './i18n/config';
import SetupVaultView from './pages/setupVault/SetupVaultView';
import VaultListView from './pages/vault/VaultListView';
import VaultItemView from './pages/vault/VaultItemView';

const App: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-primary">
      <Router>
        <Routes>
          <Route path="/" index element={<OnboardingView />} />
          <Route path="/vault/setup" element={<SetupVaultView />} />
          <Route path="/vault/import" element={<ImportVaultView />} />
          <Route path="/vault/list" element={<VaultListView />} />
          <Route path="/vault/item/detail/:chain" element={<VaultItemView />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
