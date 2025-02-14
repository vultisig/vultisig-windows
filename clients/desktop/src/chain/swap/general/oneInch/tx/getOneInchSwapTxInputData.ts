import { getSigningInputLegacyTxFields } from '@core/chain/chains/evm/tx/getSigningInputLegacyTxFields';
import { OneInchSwapPayload } from '@core/communication/vultisig/keysign/v1/1inch_swap_payload_pb';
import { EthereumSpecific } from '@core/communication/vultisig/keysign/v1/blockchain_specific_pb';
import { KeysignPayload } from '@core/communication/vultisig/keysign/v1/keysign_message_pb';
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent';
import { bigIntToHex } from '@lib/utils/bigint/bigIntToHex';
import { stripHexPrefix } from '@lib/utils/hex/stripHexPrefix';
import { TW, WalletCore } from '@trustwallet/wallet-core';

import { OneInchSwapEnabledChain } from '../OneInchSwapEnabledChains';

type Input = {
  keysignPayload: KeysignPayload;
  walletCore: WalletCore;
};

export const getOneInchSwapTxInputData = async ({
  keysignPayload,
  walletCore,
}: Input): Promise<Uint8Array> => {
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

  return TW.Ethereum.Proto.SigningInput.encode(signingInput).finish();
};
