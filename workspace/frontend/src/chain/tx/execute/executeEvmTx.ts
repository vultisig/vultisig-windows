import { assertErrorMessage } from '@lib/utils/error/assertErrorMessage';
import { isInError } from '@lib/utils/error/isInError';
import { TW } from '@trustwallet/wallet-core';
import { keccak256 } from 'js-sha3';

import { EvmChain } from '../../../model/chain';
import { getEvmPublicClient } from '../../evm/chainInfo';
import { ExecuteTxInput } from './ExecuteTxInput';

export const executeEvmTx = async ({
  walletCore,
  chain,
  compiledTx,
}: ExecuteTxInput<EvmChain>): Promise<string> => {
  const { errorMessage, encoded } =
    TW.Ethereum.Proto.SigningOutput.decode(compiledTx);

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
