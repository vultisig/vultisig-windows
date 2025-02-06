import { assertErrorMessage } from '@lib/utils/error/assertErrorMessage';
import { isInError } from '@lib/utils/error/isInError';
import { TW } from '@trustwallet/wallet-core';

import { getPolkadotApiClient } from '../../polkadot/api/getPolkadotApiClient';
import { ExecuteTxInput } from './ExecuteTxInput';

export const executePolkadotTx = async ({
  walletCore,
  compiledTx,
}: ExecuteTxInput): Promise<string> => {
  const { errorMessage: polkadotErrorMessage, encoded } =
    TW.Polkadot.Proto.SigningOutput.decode(compiledTx);

  assertErrorMessage(polkadotErrorMessage);

  const rawTx = walletCore.HexCoding.encode(encoded);

  const rpcClient = await getPolkadotApiClient();

  try {
    const { hash } = await rpcClient.rpc.author.submitExtrinsic(rawTx);
    return hash.toHex();
  } catch (error) {
    if (isInError(error, 'Transaction is temporarily banned')) {
      const extrinsic = rpcClient.createType('Extrinsic', rawTx, {
        isSigned: true,
        version: 4,
      });
      return extrinsic.hash.toHex();
    }

    throw error;
  }
};
