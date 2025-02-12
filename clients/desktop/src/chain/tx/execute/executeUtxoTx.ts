import { TW } from '@trustwallet/wallet-core';

import { UtxoChain } from '@core/chain/Chain';
import { broadcastUtxoTransaction } from '@core/chain/chains/utxo/client/broadcastUtxoTransaction';
import { hexEncode } from '../../walletCore/hexEncode';
import { ExecuteTxInput } from './ExecuteTxInput';

export const executeUtxoTx = async ({
  compiledTx,
  walletCore,
  chain,
}: ExecuteTxInput<UtxoChain>): Promise<string> => {
  const output = TW.Bitcoin.Proto.SigningOutput.decode(compiledTx);

  await broadcastUtxoTransaction({
    chain,
    tx: hexEncode({
      value: output.encoded,
      walletCore: walletCore,
    }),
  });

  return output.transactionId;
};
