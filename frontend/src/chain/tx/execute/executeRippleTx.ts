import { TW } from '@trustwallet/wallet-core';

import { shouldBeDefined } from '../../../lib/utils/assert/shouldBeDefined';
import { assertErrorMessage } from '../../../lib/utils/error/assertErrorMessage';
import SignatureProvider from '../../../services/Blockchain/signature-provider';
import { Endpoint } from '../../../services/Endpoint';
import { callRpc } from '../../rpc/callRpc';
import { assertSignature } from '../../utils/assertSignature';
import { stripHexPrefix } from '../../utils/stripHexPrefix';
import { getCoinType } from '../../walletCore/getCoinType';
import { getPreSigningHashes } from '../utils/getPreSigningHashes';
import { ExecuteTxInput } from './ExecuteTxInput';

interface RippleSubmitResponse {
  engine_result?: string;
  engine_result_message?: string;
  tx_json?: {
    hash?: string;
  };
}

export const executeRippleTx = async ({
  publicKey,
  txInputData,
  signatures,
  walletCore,
  chain,
}: ExecuteTxInput): Promise<string> => {
  const publicKeyData = publicKey.data();

  const allSignatures = walletCore.DataVector.create();
  const publicKeys = walletCore.DataVector.create();

  const [dataHash] = getPreSigningHashes({
    walletCore,
    txInputData,
    chain,
  });

  const signatureProvider = new SignatureProvider(walletCore, signatures);
  const signature = signatureProvider.getDerSignature(dataHash);

  assertSignature({
    publicKey,
    message: dataHash,
    signature,
    chain,
  });

  allSignatures.add(signature);
  publicKeys.add(publicKeyData);

  const coinType = getCoinType({
    chain,
    walletCore,
  });

  const compileWithSignatures =
    walletCore.TransactionCompiler.compileWithSignatures(
      coinType,
      txInputData,
      allSignatures,
      publicKeys
    );

  const { encoded, errorMessage } = TW.Ripple.Proto.SigningOutput.decode(
    compileWithSignatures
  );

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
