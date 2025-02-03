import { shouldBeDefined } from '@lib/utils/assert/shouldBeDefined';
import { assertErrorMessage } from '@lib/utils/error/assertErrorMessage';
import { TW } from '@trustwallet/wallet-core';

import { Endpoint } from '../../../services/Endpoint';
import { callRpc } from '../../rpc/callRpc';
import { stripHexPrefix } from '../../utils/stripHexPrefix';
import { ExecuteTxInput } from './ExecuteTxInput';

interface RippleSubmitResponse {
  engine_result?: string;
  engine_result_message?: string;
  tx_json?: {
    hash?: string;
  };
}

export const executeRippleTx = async ({
  walletCore,
  compiledTx,
}: ExecuteTxInput): Promise<string> => {
  const { encoded, errorMessage } =
    TW.Ripple.Proto.SigningOutput.decode(compiledTx);

  assertErrorMessage(errorMessage);

  const rawTx = stripHexPrefix(walletCore.HexCoding.encode(encoded));

  const { engine_result, engine_result_message, tx_json } =
    await callRpc<RippleSubmitResponse>({
      url: Endpoint.rippleServiceRpc,
      method: 'submit',
      params: [
        {
          tx_blob: rawTx,
        },
      ],
    });

  if (engine_result && engine_result !== 'tesSUCCESS') {
    if (engine_result_message) {
      if (
        engine_result_message.toLowerCase() ===
          'this sequence number has already passed.' &&
        tx_json?.hash
      ) {
        return tx_json.hash;
      }
      return engine_result_message;
    }
  }

  return shouldBeDefined(tx_json?.hash);
};
