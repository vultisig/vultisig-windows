import React, { useEffect } from 'react';
import { ISendTransaction } from '../../model/send-transaction';
import { ServiceFactory } from '../../services/ServiceFactory';
import { useWalletCore } from '../../main';
import { Chain } from '../../model/chain';
import { Vault } from '../../gen/vultisig/vault/v1/vault_pb';
import { useSendCryptoViewModel } from './SendCryptoViewModel';

interface SendCryptoDetailsViewProps {
  tx: ISendTransaction;
  vault: Vault;
  chain: Chain;
}

const SendCryptoView: React.FC<SendCryptoDetailsViewProps> = ({
  tx,
  vault,
  chain,
}) => {
  const walletCore = useWalletCore();
  const sendCryptoViewModel = useSendCryptoViewModel(tx, vault);

  useEffect(() => {
    if (!walletCore) {
      console.error('WalletCore is not initialized');
      return;
    }

    const service = ServiceFactory.getService(chain, walletCore);
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
