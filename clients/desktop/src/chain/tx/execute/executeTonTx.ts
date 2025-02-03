import { TW } from '@trustwallet/wallet-core';

import { Post } from '../../../../wailsjs/go/utils/GoHttp';
import { assertErrorMessage } from '@lib/utils/error/assertErrorMessage';
import { Endpoint } from '../../../services/Endpoint';
import { ExecuteTxInput } from './ExecuteTxInput';

export const executeTonTx = async ({
  compiledTx,
}: ExecuteTxInput): Promise<string> => {
  const output = TW.TheOpenNetwork.Proto.SigningOutput.decode(compiledTx);

  assertErrorMessage(output.errorMessage);

  const response = await Post(Endpoint.broadcastTonTransaction(), {
    boc: output.encoded,
  });

  return Buffer.from(response.result.hash, 'base64').toString('hex');
};
