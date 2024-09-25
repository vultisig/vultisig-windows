/* eslint-disable */
import React, { useEffect } from 'react';
import { useSendCryptoViewModel } from './SendCryptoViewModel';
import { useLocation } from 'react-router-dom';
import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { Balance } from '../../model/balance';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSyncAlt } from '@fortawesome/free-solid-svg-icons';

import SendCryptoForm from '../../components/sendCrypto/SendCryptoForm';
import { useWalletCore } from '../../providers/WalletCoreProvider';
import { Rate } from '../../model/price-rate';
import { getDefaultSendTransaction } from '../../model/transaction';
import { useAppPathParams } from '../../navigation/hooks/useAppPathParams';

const SendCryptoView: React.FC = () => {
  const walletCore = useWalletCore();
  const [{ chain }] = useAppPathParams<'vaultItemSend'>();
  const location = useLocation();

  const selectedChain = chain || 'THORChain';

  const { coin, balances, priceRates } = location.state as {
    coin: Coin;
    balances: Map<Coin, Balance>;
    priceRates: Map<string, Rate[]>;
  };

  const tx = getDefaultSendTransaction();
  tx.coin = coin;
  tx.fromAddress = coin.address;

  const sendCryptoViewModel = useSendCryptoViewModel(tx, balances, priceRates);

  useEffect(() => {
    sendCryptoViewModel.initializeService(walletCore, selectedChain);
  }, []);

  useEffect(() => {
    if (
      sendCryptoViewModel.service &&
      !sendCryptoViewModel.isSpecificTransactionInfoLoaded &&
      tx.coin &&
      sendCryptoViewModel.gas === 0
    ) {
      sendCryptoViewModel.loadGasInfoForSending(tx).then(() => {
        sendCryptoViewModel.setIsSpecificTransactionInfoLoaded(true);
      });
    }
  }, [
    sendCryptoViewModel.service,
    sendCryptoViewModel.isSpecificTransactionInfoLoaded,
    tx.coin,
  ]);

  return (
    sendCryptoViewModel &&
    sendCryptoViewModel.service && (
      <div className="relative text-white p-4 min-h-screen flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center w-8 h-8 bg-transparent text-white"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <span className="text-base font-semibold text-center flex-1">
            {sendCryptoViewModel.step === 'Send Crypto' ? 'Send' : 'Verify'}
          </span>
          <button className="flex items-center justify-center w-4 h-4 bg-white text-black text-xs rounded-full">
            <FontAwesomeIcon icon={faSyncAlt} />
          </button>
        </div>

        {sendCryptoViewModel.step === 'Send Crypto' && (
          <SendCryptoForm
            coin={coin}
            balances={balances}
            priceRates={priceRates}
            tx={tx}
            sendCryptoViewModel={sendCryptoViewModel}
          />
        )}
      </div>
    )
  );
};

export default SendCryptoView;
