import OnboardingView from "./pages/onboarding/OnboardingView";
import { KeygenMessage } from "./gen/vultisig/keygen/v1/keygen_message_pb";
import "./i18n/config";

function App() {
  const keygenMessage = new KeygenMessage({
    sessionId: "sessionId",
  });
  const bytes = keygenMessage.toBinary();
  console.log(bytes);
  return (
    <div className="w-full min-h-screen bg-[#02122B]">
      <OnboardingView />
    </div>
  );
}

export default App;
