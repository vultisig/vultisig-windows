import OnboardingView from "./pages/onboarding/OnboardingView";
import { KeygenMessage } from "./gen/vultisig/keygen/v1/keygen_message_pb";
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
function App() {
  const keygenMessage = new KeygenMessage({
    sessionId: "sessionId",
  });
  const bytes = keygenMessage.toBinary();
  console.log(bytes);
  return (
    <I18nextProvider i18n={i18n}>
      <div className="w-full min-h-screen bg-[#02122B]">
        <OnboardingView />
      </div>
    </I18nextProvider>
  );
}

export default App;
