import './swap.css';

import { Match } from '../../lib/ui/base/Match';
import { useStepNavigation } from '../../lib/ui/hooks/useStepNavigation';
import { useNavigateBack } from '../../navigation/hooks/useNavigationBack';
import { SendSpecificTxInfoProvider } from './fee/SendSpecificTxInfoProvider';
import { SwapForm } from './form/SwapForm';
import { SwapAmountProvider } from './state/amount';
import { CoinToProvider } from './state/coin-to';
import { SendReceiverProvider } from './state/receiver';
import { SwapQuoteProvider } from './state/selected-quote';
import { SwapProtocolProvider } from './state/swap-protocol-type';
import { SwapVerify } from './verify/SwapVerify';

const sendSteps = ['form', 'verify'] as const;

export const SwapPage = () => {
  const { step, toPreviousStep, toNextStep } = useStepNavigation({
    steps: sendSteps,
    onExit: useNavigateBack(),
  });

  return (
    <SwapProtocolProvider initialValue={null}>
      <SwapQuoteProvider initialValue={null}>
        <SwapAmountProvider initialValue={null}>
          <SendReceiverProvider initialValue="">
            <CoinToProvider initialValue={null}>
              <SendSpecificTxInfoProvider>
                <Match
                  value={step}
                  form={() => <SwapForm onForward={toNextStep} />}
                  verify={() => <SwapVerify onBack={toPreviousStep} />}
                />
              </SendSpecificTxInfoProvider>
            </CoinToProvider>
          </SendReceiverProvider>
        </SwapAmountProvider>
      </SwapQuoteProvider>
    </SwapProtocolProvider>
  );
};
