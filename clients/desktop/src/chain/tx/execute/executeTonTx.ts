import { rootApiUrl } from '@core/config';
import { assertErrorMessage } from '@lib/utils/error/assertErrorMessage';
import { queryUrl } from '@lib/utils/query/queryUrl';
import { TW } from '@trustwallet/wallet-core';

import { ExecuteTxInput } from './ExecuteTxInput';

export const executeTonTx = async ({
  compiledTx,
}: ExecuteTxInput): Promise<string> => {
  const output = TW.TheOpenNetwork.Proto.SigningOutput.decode(compiledTx);

  assertErrorMessage(output.errorMessage);

  const url = `${rootApiUrl}/ton/v2/sendBocReturnHash`;

  const response = await queryUrl<{ result: { hash: string } }>(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ boc: output.encoded }),
  });

  return Buffer.from(response.result.hash, 'base64').toString('hex');
};
