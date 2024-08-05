import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { KeygenMessage } from "./gen/vultisig/keygen/v1/keygen_message_pb";
import OnboardingView from "./pages/onboarding/OnboardingView";
import ImportVaultView from "./pages/importVault/ImportVaultView";
import "./i18n/config";
import KeygenPeerDiscoveryView from "./pages/keygenPeerDiscovery/KeygenPeerDiscoveryView";


function App() {
  return (
    <div className="w-full min-h-screen bg-[#02122B]">
      <Router>
        <Routes>
          <Route path="/" index element={<OnboardingView />} />
          <Route path="/vault/import" element={<ImportVaultView />} />
          {/* sample */}
          <Route path="/keygen/peer-discovery" element={<KeygenPeerDiscoveryView vaultType="2/2" />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
