import { create } from '@bufbuild/protobuf';
import { getErc20ApproveTxInputData } from '@core/chain/chains/evm/tx/getErc20ApproveTxInputData';
import { incrementKeysignPayloadNonce } from '@core/chain/chains/evm/tx/incrementKeysignPayloadNonce';
import {
  KeysignPayload,
  KeysignPayloadSchema,
} from '@core/communication/vultisig/keysign/v1/keysign_message_pb';
import { getPreSignedInputData } from '@core/keysign/preSignedInputData/index';
import { matchDiscriminatedUnion } from '@lib/utils/matchDiscriminatedUnion';
import { WalletCore } from '@trustwallet/wallet-core';

import { getOneInchSwapTxInputData } from '../../../chain/swap/general/oneInch/tx/getOneInchSwapTxInputData';
import { getThorchainSwapTxInputData } from '../../../chain/swap/native/thor/tx/getThorchainSwapTxInputData';
import { getKeysignChain } from './getKeysignChain';

type Input = {
  keysignPayload: KeysignPayload;
  walletCore: WalletCore;
};

export const getTxInputData = async ({
  keysignPayload,
  walletCore,
}: Input): Promise<Uint8Array[]> => {
  const chain = getKeysignChain(keysignPayload);

  const { erc20ApprovePayload, ...restOfKeysignPayload } = keysignPayload;
  if (erc20ApprovePayload) {
    const approveTxInputData = getErc20ApproveTxInputData({
      keysignPayload,
      walletCore,
    });

    const restOfTxInputData = await getTxInputData({
      keysignPayload: incrementKeysignPayloadNonce(
        create(KeysignPayloadSchema, restOfKeysignPayload)
      ),
      walletCore,
    });

    return [approveTxInputData, ...restOfTxInputData];
  }

  if ('swapPayload' in keysignPayload && keysignPayload.swapPayload.value) {
    const txInputData: Uint8Array = await matchDiscriminatedUnion(
      keysignPayload.swapPayload,
      'case',
      'value',
      {
        thorchainSwapPayload: () =>
          getThorchainSwapTxInputData({
            keysignPayload,
            walletCore,
          }),
        mayachainSwapPayload: () => {
          throw new Error('Mayachain swap not supported');
        },
        oneinchSwapPayload: () =>
          getOneInchSwapTxInputData({
            keysignPayload,
            walletCore,
          }),
      }
    );

    return [txInputData];
  }

  const txInputData = await getPreSignedInputData({
    keysignPayload,
    walletCore,
    chain,
  });

  return [txInputData];
};
