import { TW, WalletCore } from '@trustwallet/wallet-core';

import { OneInchSwapPayload } from '../../../../gen/vultisig/keysign/v1/1inch_swap_payload_pb';
import { EthereumSpecific } from '../../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { KeysignPayload } from '../../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { shouldBePresent } from '../../../../lib/utils/assert/shouldBePresent';
import { getSigningInputLegacyTxFields } from '../../../evm/tx/getSigningInputLegacyTxFields';
import { getPreSigningHashes } from '../../../tx/utils/getPreSigningHashes';
import { bigIntToHex } from '../../../utils/bigIntToHex';
import { stripHexPrefix } from '../../../utils/stripHexPrefix';
import { OneInchSwapEnabledChain } from '../OneInchSwapEnabledChains';

type Input = {
  keysignPayload: KeysignPayload;
  walletCore: WalletCore;
};

export const getOneInchSwapPreSignedImageHashes = async ({
  keysignPayload,
  walletCore,
}: Input): Promise<string[]> => {
  const swapPayload = shouldBePresent(keysignPayload.swapPayload)
    .value as OneInchSwapPayload;

  const fromCoin = shouldBePresent(swapPayload.fromCoin);
  const fromChain = fromCoin.chain as OneInchSwapEnabledChain;

  const tx = shouldBePresent(swapPayload.quote?.tx);

  const amountHex = Buffer.from(
    stripHexPrefix(bigIntToHex(BigInt(tx.value || 0))),
    'hex'
  );

  const { blockchainSpecific } = keysignPayload;

  const { nonce } = blockchainSpecific.value as EthereumSpecific;

  const signingInput = TW.Ethereum.Proto.SigningInput.create({
    toAddress: tx.to,
    transaction: {
      contractGeneric: {
        amount: amountHex,
        data: Buffer.from(stripHexPrefix(tx.data), 'hex'),
      },
    },
    ...getSigningInputLegacyTxFields({
      chain: fromChain,
      walletCore,
      nonce,
      gasPrice: BigInt(tx.gasPrice || 0),
      gasLimit: BigInt(tx.gas),
    }),
  });

  const txInputData =
    TW.Ethereum.Proto.SigningInput.encode(signingInput).finish();

  return getPreSigningHashes({
    walletCore,
    txInputData,
    chain: fromChain,
  });
};
