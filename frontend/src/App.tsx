import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { KeygenMessage } from './gen/vultisig/keygen/v1/keygen_message_pb';
import OnboardingView from './pages/onboarding/OnboardingView';
import ImportVaultView from './pages/importVault/ImportVaultView';
import './i18n/config';
import SetupVaultView from './pages/setupVault/SetupVaultView';

const App: React.FC = () => {
  const keygenMessage = new KeygenMessage({
    sessionId: 'sessionId',
  });
  const bytes = keygenMessage.toBinary();
  console.log(bytes);
  return (
    <div className="w-full min-h-screen bg-primary">
      <Router>
        <Routes>
          <Route path="/" index element={<OnboardingView />} />
          <Route path="/vault/setup" element={<SetupVaultView />} />
          <Route path="/vault/import" element={<ImportVaultView />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
