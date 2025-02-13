import { getSolanaClient } from '@core/chain/chains/solana/client';
import { assertErrorMessage } from '@lib/utils/error/assertErrorMessage';
import { Transaction } from '@solana/web3.js';
import { TW } from '@trustwallet/wallet-core';
import base58 from 'bs58';
import { ExecuteTxInput } from './ExecuteTxInput';

export const executeSolanaTx = async ({
  compiledTx,
}: ExecuteTxInput): Promise<string> => {
  const { encoded, errorMessage: solanaErrorMessage } =
    TW.Solana.Proto.SigningOutput.decode(compiledTx);

  assertErrorMessage(solanaErrorMessage);

  const client = getSolanaClient();
  const transactionBuffer = base58.decode(encoded);
  const transaction = Transaction.from(transactionBuffer);

  const result = await client.sendRawTransaction(transaction.serialize(), {
    skipPreflight: false,
    preflightCommitment: 'confirmed',
    maxRetries: 3,
  });

  return result;
};
