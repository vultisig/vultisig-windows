import React, { useEffect } from 'react';
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

const SendCryptoView: React.FC = () => {
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
    <div className="flex flex-col h-screen">
      <div className="bg-gray-100 p-4">
        <div>
          <label htmlFor="fromAddress">From:</label>
          <input
            id="fromAddress"
            type="text"
            value={tx.fromAddress}
            disabled={true}
          />
        </div>
        <div>
          <label htmlFor="toAddress">To:</label>
          <input id="toAddress" type="text" value={tx.toAddress} />
        </div>
        {sendCryptoViewModel.showMemoField && (
          <div>
            <label htmlFor="memo">Memo (optional):</label>
            <input id="memo" type="text" value={tx.memo} />
          </div>
        )}
        <div className="flex items-center justify-between">
          <button onClick={() => sendCryptoViewModel.handleMaxPressed(25)}>
            25%
          </button>
          <button onClick={() => sendCryptoViewModel.handleMaxPressed(50)}>
            50%
          </button>
        </div>
        <div>
          <label htmlFor="amount">Amount:</label>
          <input
            id="amount"
            type="text"
            value={sendCryptoViewModel.amount}
            onChange={e =>
              sendCryptoViewModel.handleAmountChange(e.target.value)
            }
          />
        </div>
        <div>
          <label htmlFor="amountInFiat">Amount (in Fiat):</label>
          <input id="amountInFiat" type="text" value={tx.amountInFiat} />
        </div>
        <button onClick={sendCryptoViewModel.validateForm}>Continue</button>
      </div>
      {sendCryptoViewModel.isLoading && <div>Loading...</div>}
      {sendCryptoViewModel.errorMessage && (
        <div>{sendCryptoViewModel.errorMessage}</div>
      )}
    </div>
  );
};

export default SendCryptoView;
