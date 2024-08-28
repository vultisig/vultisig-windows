/* eslint-disable */
import React from 'react';
import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { Balance } from '../../model/balance';
import { ISendTransaction } from '../../model/send-transaction';
import { useSendCryptoViewModel } from '../../pages/send/SendCryptoViewModel';
import { Rate } from '../../model/price-rate';

interface SendCryptoFormProps {
  coin: Coin;
  balances: Map<Coin, Balance>;
  priceRates: Map<string, Rate[]>;
  tx: ISendTransaction;
  sendCryptoViewModel: ReturnType<typeof useSendCryptoViewModel>;
}

const SendCryptoForm: React.FC<SendCryptoFormProps> = ({
  coin,
  balances,
  //priceRates,
  tx,
  sendCryptoViewModel,
}) => {
  const icon = `/assets/icons/coins/${coin.logo}.svg`;

  return (
    <div className="flex flex-col space-y-4 rounded-lg p-4 flex-grow">
      {/* Custom Floating Alert */}
      {sendCryptoViewModel.showAlert && (
        <div
          className="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-300 shadow-lg rounded-lg p-6 text-gray-800 max-w-md w-full"
          role="alert"
        >
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-bold">Error</span>
            <span
              className="text-gray-500 cursor-pointer"
              onClick={() => sendCryptoViewModel.setShowAlert(false)}
            >
              <svg
                className="fill-current h-6 w-6"
                role="button"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <title>Close</title>
                <path d="M14.348 5.652a.5.5 0 00-.707 0L10 9.293 6.36 5.652a.5.5 0 10-.707.707L9.293 10l-3.64 3.64a.5.5 0 10.707.707L10 10.707l3.64 3.64a.5.5 0 00.707-.707L10.707 10l3.64-3.64a.5.5 0 000-.708z" />
              </svg>
            </span>
          </div>
          <div>
            <span className="block text-sm">
              {sendCryptoViewModel.errorMessage}
            </span>
          </div>
          <div className="mt-4 text-right">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring"
              onClick={() => sendCryptoViewModel.setShowAlert(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col space-y-2">
        <div className="text-body-12 font-menlo text-neutral-0 placeholder-neutral-300 w-full py-3 px-3 bg-blue-600 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div
                className="flex items-center justify-center w-9 h-9 text-black text-xs rounded-full"
                style={{
                  backgroundImage: `url(${icon})`,
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
              >
                {/* Optionally keep the ticker as a fallback or overlay */}
                {/* <span className="sr-only">{coin.ticker}</span> */}
              </div>

              <div className="flex flex-col ml-4">
                <div className="chain-name">{coin.ticker}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              balance: {balances.get(coin)?.decimalAmount}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col space-y-2">
        <label
          htmlFor="fromAddress"
          className="text-neutral-0 text-sm font-medium"
        >
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
        <label
          htmlFor="toAddress"
          className="text-neutral-0 text-sm font-medium"
        >
          To:
        </label>
        <input
          id="toAddress"
          type="text"
          value={sendCryptoViewModel.toAddress}
          className="text-body-12 font-menlo text-neutral-0 placeholder-neutral-300 h-12 w-full px-3 bg-blue-600 rounded-lg"
          onChange={e =>
            sendCryptoViewModel.handleToAddressChange(e.target.value)
          }
          placeholder="Enter Address"
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
          />
        </div>
      )}
      <div className="flex items-center">
        <label htmlFor="amount" className="text-neutral-0 text-sm font-medium">
          Amount:
        </label>
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
        <label
          htmlFor="amountInFiat"
          className="text-neutral-0 text-sm font-medium"
        >
          Amount (in Fiat):
        </label>
        <div className="relative">
          <input
            id="amountInFiat"
            type="text"
            value={sendCryptoViewModel.amountInFiat}
            onChange={e =>
              sendCryptoViewModel.handleAmountInFiatChange(e.target.value)
            }
            className="text-body-12 font-menlo text-neutral-0 placeholder-neutral-300 h-12 w-full px-3 bg-blue-600 rounded-lg"
            placeholder="Enter Amount In Fiat"
          />
        </div>
      </div>
      <div className="flex-grow"></div>
      <button
        className="mt-4 text-body-14 font-montserrat font-bold text-blue-600 placeholder-neutral-300 h-12 w-full px-3 bg-turquoise-600 rounded-full"
        onClick={() => {
          sendCryptoViewModel.moveToNextView('Verify Transaction');
        }}
      >
        Continue
      </button>
    </div>
  );
};

export default SendCryptoForm;
