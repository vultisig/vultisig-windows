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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSyncAlt } from '@fortawesome/free-solid-svg-icons';

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
    <div className="relative text-white p-4 min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center justify-center w-8 h-8 bg-transparent text-white"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>

        {/* Chain Name */}
        <span className="text-lg font-bold text-center flex-1">{chain}</span>

        {/* Refresh Button */}
        <button className="flex items-center justify-center w-4 h-4 bg-white text-black text-xs rounded-full">
          <FontAwesomeIcon icon={faSyncAlt} />
        </button>
      </div>

      {/* Form */}
      <div className="flex flex-col space-y-4 rounded-lg p-4 flex-grow">
        <div className="flex flex-col space-y-2">
          <label htmlFor="fromAddress" className="text-neutral-0 text-sm">
            From:
          </label>
          <input
            id="fromAddress"
            type="text"
            value={tx.fromAddress}
            disabled={true}
            className="text-body-12 font-menlo text-neutral-0 h-12 w-full text-left px-3 bg-blue-600 rounded-lg overflow-hidden"
          />
        </div>
        <div className="flex flex-col space-y-2">
          <label htmlFor="toAddress" className="text-neutral-0 text-sm">
            To:
          </label>
          <input
            id="toAddress"
            type="text"
            value={tx.toAddress}
            className="text-body-12 font-menlo text-neutral-0 placeholder-neutral-300 h-12 w-full px-3 bg-blue-600 rounded-lg"
          />
        </div>
        {sendCryptoViewModel.showMemoField && (
          <div className="flex flex-col space-y-2">
            <label htmlFor="memo">Memo (optional):</label>
            <input
              id="memo"
              type="text"
              value={tx.memo}
              className="text-body-12 font-menlo text-neutral-0 placeholder-neutral-300 h-12 w-full px-3 bg-blue-600 rounded-lg"
              // onChange={e =>
              //   sendCryptoViewModel.handleMemoChange(e.target.value)
              // }
            />
          </div>
        )}
        <div className="flex items-center">
          <label htmlFor="amount" className="text-neutral-0 text-sm">
            Amount:
          </label>

          {/* Spacer */}
          <div className="flex-grow"></div>

          <button
            className="text-body-12 font-menlo text-neutral-0 w-20 px-3 bg-blue-600 rounded-lg"
            onClick={() => sendCryptoViewModel.handleMaxPressed(25)}
          >
            25%
          </button>

          <button
            className="text-body-12 font-menlo text-neutral-0 w-20 px-3 bg-blue-600 rounded-lg ml-2"
            onClick={() => sendCryptoViewModel.handleMaxPressed(50)}
          >
            50%
          </button>
        </div>
        <div className="flex flex-col space-y-2">
          <div className="relative">
            <input
              id="amount"
              type="text"
              value={sendCryptoViewModel.amount}
              onChange={e =>
                sendCryptoViewModel.handleAmountChange(e.target.value)
              }
              className="text-body-12 font-menlo text-neutral-0 placeholder-neutral-300 h-12 w-full px-3 bg-blue-600 rounded-lg"
              placeholder="Enter Amount"
            />
            <button
              onClick={() => sendCryptoViewModel.handleMaxPressed(100)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-body-16 font-menlo text-neutral-0"
            >
              MAX
            </button>
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          <label htmlFor="amountInFiat" className="text-neutral-0 text-sm">
            Amount (in Fiat):
          </label>
          <div className="relative">
            <input
              id="amountInFiat"
              type="text"
              value={tx.amountInFiat}
              // onChange={e =>
              //   sendCryptoViewModel.handleFiatAmountChange(e.target.value)
              // }
              className="text-body-12 font-menlo text-neutral-0 placeholder-neutral-300 h-12 w-full px-3 bg-blue-600 rounded-lg"
              placeholder="Enter Amount In Fiat"
            />
          </div>
        </div>
        <div className="flex-grow"></div> {/* Spacer */}
        <button
          className="mt-4 text-body-14 font-montserrat font-bold text-blue-600 placeholder-neutral-300 h-12 w-full px-3 bg-turquoise-600 rounded-full"
          onClick={sendCryptoViewModel.validateForm}
        >
          Continue
        </button>
      </div>

      {sendCryptoViewModel.isLoading && <div>Loading...</div>}
      {sendCryptoViewModel.errorMessage && (
        <div>{sendCryptoViewModel.errorMessage}</div>
      )}
    </div>
  );
};

export default SendCryptoView;
