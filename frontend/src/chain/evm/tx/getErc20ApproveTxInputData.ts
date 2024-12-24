import { TW, WalletCore } from '@trustwallet/wallet-core';

import { EthereumSpecific } from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { Chain } from '../../../model/chain';
import { bigIntToHex } from '../../utils/bigIntToHex';
import { stripHexPrefix } from '../../utils/stripHexPrefix';
import { getSigningInputEnvelopedTxFields } from './getSigningInputEnvelopedTxFields';

type Input = {
  keysignPayload: KeysignPayload;
  walletCore: WalletCore;
};

export const getErc20ApproveTxInputData = ({
  keysignPayload,
  walletCore,
}: Input) => {
  const { amount, spender } = shouldBePresent(
    keysignPayload.erc20ApprovePayload
  );

  const amountHex = Buffer.from(
    stripHexPrefix(bigIntToHex(BigInt(amount))),
    'hex'
  );

  const coin = shouldBePresent(keysignPayload.coin);
  const chain = coin.chain as Chain;

  const { blockchainSpecific } = keysignPayload;

  const { maxFeePerGasWei, priorityFee, nonce, gasLimit } =
    blockchainSpecific.value as EthereumSpecific;

  const signingInput = TW.Ethereum.Proto.SigningInput.create({
    transaction: {
      erc20Approve: {
        amount: amountHex,
        spender,
      },
    },
    toAddress: shouldBePresent(keysignPayload.coin).contractAddress,
    ...getSigningInputEnvelopedTxFields({
      chain,
      walletCore,
      maxFeePerGasWei,
      priorityFee,
      nonce,
      gasLimit,
    }),
  });

  return TW.Ethereum.Proto.SigningInput.encode(signingInput).finish();
};
