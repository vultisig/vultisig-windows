import { TW } from '@trustwallet/wallet-core';

import { assertErrorMessage } from '@lib/utils/error/assertErrorMessage';
import { Endpoint } from '../../../services/Endpoint';
import { callRpc } from '../../rpc/callRpc';
import { ExecuteTxInput } from './ExecuteTxInput';

export const executePolkadotTx = async ({
  walletCore,
  compiledTx,
}: ExecuteTxInput): Promise<string> => {
  const { errorMessage: polkadotErrorMessage, encoded } =
    TW.Polkadot.Proto.SigningOutput.decode(compiledTx);

  assertErrorMessage(polkadotErrorMessage);

  const rawTx = walletCore.HexCoding.encode(encoded);

  return callRpc({
    url: Endpoint.polkadotServiceRpc,
    method: 'author_submitExtrinsic',
    params: [rawTx],
  });
};
