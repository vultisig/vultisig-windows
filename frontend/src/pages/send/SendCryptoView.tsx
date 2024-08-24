/* eslint-disable */
import React, { useEffect, useState } from 'react';
import {
  getDefaultSendTransaction,
  ISendTransaction,
} from '../../model/send-transaction';
import { ServiceFactory } from '../../services/ServiceFactory';
import { useWalletCore } from '../../main';
import { useSendCryptoViewModel } from './SendCryptoViewModel';
import { useLocation, useParams } from 'react-router-dom';
import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { Balance } from '../../model/balance';
import { ChainUtils } from '../../model/chain';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSyncAlt } from '@fortawesome/free-solid-svg-icons';

import SendCryptoForm from '../../components/sendCrypto/SendCryptoForm';
import VerifyTransaction from '../../components/sendCrypto/VerifyTransaction';

const SendCryptoView: React.FC = () => {
  const [step, setStep] = useState<'Send Crypto' | 'Verify Transaction'>(
    'Send Crypto'
  );

  const walletCore = useWalletCore();
  const { chain } = useParams<{ chain: string }>();
  const location = useLocation();

  const { coin, balances } = location.state as {
    coin: Coin;
    balances: Map<Coin, Balance>;
  };

  const tx: ISendTransaction = getDefaultSendTransaction();
  tx.coin = coin;
  tx.fromAddress = coin.address;

  const sendCryptoViewModel = useSendCryptoViewModel(tx, balances);

  useEffect(() => {
    if (!walletCore) {
      console.error('WalletCore is not initialized');
      return;
    }

    if (!chain) {
      console.error('Chain is not provided');
      return;
    }

    const chainEnum = ChainUtils.stringToChain(chain);
    if (!chainEnum) {
      console.error('Chain is not supported');
      return;
    }

    const service = ServiceFactory.getService(chainEnum, walletCore);
    sendCryptoViewModel.setService(service);
  }, [walletCore, chain, sendCryptoViewModel]);

  return (
    <div className="relative text-white p-4 min-h-screen flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => window.history.back()}
          className="flex items-center justify-center w-8 h-8 bg-transparent text-white"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <span className="text-base font-semibold text-center flex-1">
          {step === 'Send Crypto' ? 'Send' : 'Verify'}
        </span>
        <button className="flex items-center justify-center w-4 h-4 bg-white text-black text-xs rounded-full">
          <FontAwesomeIcon icon={faSyncAlt} />
        </button>
      </div>

      {step === 'Send Crypto' && (
        <SendCryptoForm
          coin={coin}
          balances={balances}
          tx={tx}
          onContinue={() => setStep('Verify Transaction')}
          sendCryptoViewModel={sendCryptoViewModel}
        />
      )}

      {step === 'Verify Transaction' && (
        <VerifyTransaction
          fromAddress={tx.fromAddress}
          toAddress={sendCryptoViewModel.toAddress}
          amount={sendCryptoViewModel.amount}
          amountInFiat={sendCryptoViewModel.amountInFiat}
          gas="0.001 SOL"
        />
      )}
    </div>
  );
};

export default SendCryptoView;
