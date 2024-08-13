import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OnboardingView from './pages/onboarding/OnboardingView';
import ImportVaultView from './pages/importVault/ImportVaultView';
import './i18n/config';
import SetupVaultView from './pages/setupVault/SetupVaultView';
import VaultView from './pages/vaultList/VaultView';

const App: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-primary">
      <Router>
        <Routes>
          <Route path="/" index element={<OnboardingView />} />
          <Route path="/vault/setup" element={<SetupVaultView />} />
          <Route path="/vault/import" element={<ImportVaultView />} />
          <Route path="/vault/details" element={<VaultView />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
