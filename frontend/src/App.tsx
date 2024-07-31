import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { KeygenMessage } from "./gen/vultisig/keygen/v1/keygen_message_pb";
import OnboardingView from "./pages/onboarding/OnboardingView";
import ImportVaultView from "./pages/importVault/ImportVaultView";

function App() {
  const keygenMessage = new KeygenMessage({
    sessionId: "sessionId",
  });
  const bytes = keygenMessage.toBinary();
  console.log(bytes);
  return (
    <div className="w-full min-h-screen bg-[#02122B]">
      <Router>
        <Routes>
          <Route path="/" index element={<OnboardingView />} />
          <Route path="/vault/import" element={<ImportVaultView />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
