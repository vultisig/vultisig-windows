/* eslint-disable */
import React from 'react';
import SolSvg from '../../../public/assets/icons/coins/sol.svg';
import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { Balance } from '../../model/balance';
import { ISendTransaction } from '../../model/send-transaction';
import { useSendCryptoViewModel } from '../../pages/send/SendCryptoViewModel';

interface SendCryptoFormProps {
  coin: Coin;
  balances: Map<Coin, Balance>;
  tx: ISendTransaction;
  onContinue: () => void;
  sendCryptoViewModel: ReturnType<typeof useSendCryptoViewModel>;
}

const SendCryptoForm: React.FC<SendCryptoFormProps> = ({
  coin,
  balances,
  tx,
  onContinue,
  sendCryptoViewModel,
}) => {
  return (
    <div className="flex flex-col space-y-4 rounded-lg p-4 flex-grow">
      <div className="flex flex-col space-y-2">
        <div className="text-body-12 font-menlo text-neutral-0 placeholder-neutral-300 w-full py-3 px-3 bg-blue-600 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="flex items-center justify-center bg-black p-1.5 rounded-full">
                <img src={SolSvg} alt="" className="w-4 h-4" />
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
          sendCryptoViewModel.validateForm();
          onContinue();
        }}
      >
        Continue
      </button>
    </div>
  );
};

export default SendCryptoForm;
