import { assertErrorMessage } from '@lib/utils/error/assertErrorMessage';
import { Base64EncodedWireTransaction } from '@solana/web3.js';
import { TW } from '@trustwallet/wallet-core';

import { getSolanaRpcClient } from '../../solana/rpc/getSolanaRpcClient';
import { ExecuteTxInput } from './ExecuteTxInput';

export const executeSolanaTx = async ({
  compiledTx,
}: ExecuteTxInput): Promise<string> => {
  const { encoded, errorMessage: solanaErrorMessage } =
    TW.Solana.Proto.SigningOutput.decode(compiledTx);

  assertErrorMessage(solanaErrorMessage);

  const client = getSolanaRpcClient();

  const result = await client
    .sendTransaction(encoded as Base64EncodedWireTransaction, {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
      maxRetries: BigInt(3),
    })
    .send();

  return result;
};
