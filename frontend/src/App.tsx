import './App.css';
import OnboardingView from './pages/onboarding/OnboardingView';
import {KeygenMessage} from './gen/vultisig/keygen/v1/keygen_message_pb';
function App() {
    let keygenMessage = new KeygenMessage({
        sessionId: "sessionId",
        }
    );
    const bytes = keygenMessage.toBinary()
    console.log(bytes)
    return (
        <div id="App">
            <OnboardingView/>
        </div>
    )
}

export default App
