import { TW } from '@trustwallet/wallet-core';
import { keccak256 } from 'js-sha3';

import { assertErrorMessage } from '../../../lib/utils/error/assertErrorMessage';
import { isInError } from '../../../lib/utils/error/isInError';
import { EvmChain } from '../../../model/chain';
import { getEvmPublicClient } from '../../evm/chainInfo';
import { assertSignature } from '../../utils/assertSignature';
import { generateSignatureWithRecoveryId } from '../../utils/generateSignatureWithRecoveryId';
import { getCoinType } from '../../walletCore/getCoinType';
import { hexEncode } from '../../walletCore/hexEncode';
import { getPreSigningHashes } from '../utils/getPreSigningHashes';
import { ExecuteTxInput } from './ExecuteTxInput';

export const executeEvmTx = async ({
  publicKey,
  txInputData,
  signatures,
  walletCore,
  chain,
}: ExecuteTxInput<EvmChain>): Promise<string> => {
  const [dataHash] = getPreSigningHashes({
    walletCore: walletCore,
    chain: chain,
    txInputData,
  });

  const signature = generateSignatureWithRecoveryId({
    walletCore: walletCore,
    signature:
      signatures[hexEncode({ value: dataHash, walletCore: walletCore })],
  });

  assertSignature({
    publicKey,
    signature,
    message: dataHash,
    chain,
  });

  const allSignatures = walletCore.DataVector.createWithData(signature);

  const coinType = getCoinType({
    chain,
    walletCore,
  });

  const compiled = walletCore.TransactionCompiler.compileWithSignatures(
    coinType,
    txInputData,
    allSignatures,
    walletCore.DataVector.create()
  );

  const { errorMessage, encoded } =
    TW.Ethereum.Proto.SigningOutput.decode(compiled);

  assertErrorMessage(errorMessage);

  const rawTx = walletCore.HexCoding.encode(encoded);
  const txHash = '0x' + keccak256(encoded);

  const publicClient = getEvmPublicClient(chain as EvmChain);

  try {
    const hash = await publicClient.sendRawTransaction({
      serializedTransaction: rawTx as `0x${string}`,
    });
    return hash;
  } catch (error) {
    const isAlreadyBroadcast = isInError(
      error,
      'already known',
      'transaction is temporarily banned',
      'nonce too low',
      'transaction already exists'
    );

    if (isAlreadyBroadcast) {
      return txHash;
    }

    throw error;
  }
};
