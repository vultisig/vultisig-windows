import { WalletCore } from '@trustwallet/wallet-core';

import { getErc20ApprovePreSignedImageHash } from '../../../chain/evm/tx/getErc20ApprovePreSignedImageHash';
import { incrementKeysignPayloadNonce } from '../../../chain/evm/tx/incrementKeysignPayloadNonce';
import { getThorchainSwapPreSignedImageHashes } from '../../../chain/swap/native/thor/tx/getThorchainSwapPreSignedImageHashes';
import { getOneInchSwapPreSignedImageHashes } from '../../../chain/swap/oneInch/tx/getOneInchSwapPreSignedImageHashes';
import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { matchDiscriminatedUnion } from '../../../lib/utils/matchDiscriminatedUnion';
import { Chain } from '../../../model/chain';
import { BlockchainServiceFactory } from '../../../services/Blockchain/BlockchainServiceFactory';

type Input = {
  keysignPayload: KeysignPayload;
  walletCore: WalletCore;
};

export const getPreSignedImageHashes = async ({
  keysignPayload,
  walletCore,
}: Input): Promise<string[]> => {
  const coin = shouldBePresent(keysignPayload.coin);
  const chain = coin.chain as Chain;

  const { erc20ApprovePayload, ...restOfKeysignPayload } = keysignPayload;
  if (erc20ApprovePayload) {
    const approveImageHash = getErc20ApprovePreSignedImageHash({
      keysignPayload,
      walletCore,
    });

    const restOfImageHashes = await getPreSignedImageHashes({
      keysignPayload: incrementKeysignPayloadNonce(
        new KeysignPayload(restOfKeysignPayload)
      ),
      walletCore,
    });

    return [approveImageHash, ...restOfImageHashes];
  }

  if ('swapPayload' in keysignPayload && keysignPayload.swapPayload.value) {
    return matchDiscriminatedUnion(
      keysignPayload.swapPayload,
      'case',
      'value',
      {
        thorchainSwapPayload: () =>
          getThorchainSwapPreSignedImageHashes({
            keysignPayload,
            walletCore,
          }),
        mayachainSwapPayload: () => {
          throw new Error('Mayachain swap not supported');
        },
        oneinchSwapPayload: () =>
          getOneInchSwapPreSignedImageHashes({
            keysignPayload,
            walletCore,
          }),
      }
    );
  }

  const service = BlockchainServiceFactory.createService(chain, walletCore);

  return service.getPreSignedImageHash(keysignPayload);
};
