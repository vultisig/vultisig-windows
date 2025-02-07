import { rootApiUrl } from '@core/config';
import { assertErrorMessage } from '@lib/utils/error/assertErrorMessage';
import { TW } from '@trustwallet/wallet-core';

import { Post } from '../../../../wailsjs/go/utils/GoHttp';
import { ExecuteTxInput } from './ExecuteTxInput';

export const executeTonTx = async ({
  compiledTx,
}: ExecuteTxInput): Promise<string> => {
  const output = TW.TheOpenNetwork.Proto.SigningOutput.decode(compiledTx);

  assertErrorMessage(output.errorMessage);

  const url = `${rootApiUrl}/ton/v2/sendBocReturnHash`;

  const response = await Post(url, {
    boc: output.encoded,
  });

  return Buffer.from(response.result.hash, 'base64').toString('hex');
};
