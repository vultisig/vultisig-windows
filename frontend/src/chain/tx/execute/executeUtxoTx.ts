import { TW } from '@trustwallet/wallet-core';

import { UtxoChain } from '../../../model/chain';
import { broadcastUtxoTransaction } from '../../utxo/blockchair/broadcastUtxoTransaction';
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
