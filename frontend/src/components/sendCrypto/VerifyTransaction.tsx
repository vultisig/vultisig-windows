/* eslint-disable */
import { faShieldHalved } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';

interface VerifyTransactionViewProps {
  fromAddress: string;
  toAddress: string;
  amount: string;
  amountInFiat: string;
  gas: string;
}

const VerifyTransaction: React.FC<VerifyTransactionViewProps> = ({
  fromAddress,
  toAddress,
  amount,
  amountInFiat,
  gas,
}) => {
  const [isChecked, setIsChecked] = useState({
    address: false,
    amount: false,
    scamCheck: false,
  });

  const handleCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked({
      ...isChecked,
      [e.target.name]: e.target.checked,
    });
  };

  return (
    <div className="relative text-white font-menlo p-4 flex flex-col flex-grow bg-dark-800">
      {/* Transaction Details */}
      <div className="bg-blue-600 rounded-lg p-4 space-y-3">
        <div className="border-b border-white/10 pb-2">
          <div className="text-lg font-semibold">From</div>
          <div className="text-body-12 font-menlo text-secondary break-all">
            {fromAddress}
          </div>
        </div>
        <div className="border-b border-white/10 pb-2">
          <div className="text-lg font-semibold">To</div>
          <div className="text-body-12 font-menlo text-secondary break-all">
            {toAddress}
          </div>
        </div>
        <div className="border-b border-white/10 pb-2 flex items-center justify-between">
          <div className="text-lg font-semibold">Amount</div>
          <div className="text-body-12 font-menlo text-neutral-0 font-medium">
            {amount} SOL
          </div>
        </div>
        <div className="border-b border-white/10 pb-2 flex items-center justify-between">
          <div className="text-lg font-semibold">Amount (in USD)</div>
          <div className="text-body-12 font-menlo text-neutral-0 font-medium">
            US${amountInFiat}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">Gas</div>
          <div className="text-body-12 font-menlo text-neutral-0 font-medium">
            {gas}
          </div>
        </div>
      </div>
      {/* Checkbox Confirmation */}
      <div className="mt-7 space-y-2">
        <label className="flex items-center gap-2.5">
          <input
            type="checkbox"
            name="address"
            checked={isChecked.address}
            onChange={handleCheckChange}
            className="h-4 w-4 rounded bg-blue-400"
          />
          <span className="text-sm">I'm sending to the right address</span>
        </label>
        <label className="flex items-center gap-2.5">
          <input
            type="checkbox"
            name="amount"
            checked={isChecked.amount}
            onChange={handleCheckChange}
            className="h-4 w-4 rounded bg-blue-400"
          />
          <span className="text-sm">The amount is correct</span>
        </label>
        <label className="flex items-center gap-2.5">
          <input
            type="checkbox"
            name="scamCheck"
            checked={isChecked.scamCheck}
            onChange={handleCheckChange}
            className="h-4 w-4 rounded bg-blue-400"
          />
          <span className="text-sm">
            I'm not sending my money to a scam or hacker
          </span>
        </label>
      </div>
      {/* Transaction Verified */}
      <div className="flex-grow"></div> {/* Spacer */}
      <div className="mb-10 w-full flex items-center justify-center">
        <div className="bg-green-900 border-2 border-green-500 flex items-center gap-2.5 text-center text-white rounded-xl p-2.5 w-72 font-semibold text-xs">
          <FontAwesomeIcon icon={faShieldHalved} /> Transaction verified by
          Blowfish
        </div>
      </div>
      {/* Sign Button */}
      <button
        className="block text-body-14 font-montserrat font-bold text-blue-600 bg-turquoise-600 h-12 w-full rounded-full"
        disabled={
          !isChecked.address || !isChecked.amount || !isChecked.scamCheck
        }
      >
        Sign
      </button>
    </div>
  );
};

export default VerifyTransaction;