import { TW, WalletCore } from '@trustwallet/wallet-core';

import { EthereumSpecific } from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { Chain } from '../../../model/chain';
import { bigIntToHex } from '../../utils/bigIntToHex';
import { stripHexPrefix } from '../../utils/stripHexPrefix';
import { getCoinType } from '../../walletCore/getCoinType';
import { getSigningInputEnvelopedTxFields } from './getSigningInputEnvelopedTxFields';

type Input = {
  keysignPayload: KeysignPayload;
  walletCore: WalletCore;
};

export const getErc20ApprovePreSignedImageHash = ({
  keysignPayload,
  walletCore,
}: Input): string => {
  const { amount, spender } = shouldBePresent(
    keysignPayload.erc20ApprovePayload
  );

  const amountHex = Buffer.from(
    stripHexPrefix(bigIntToHex(BigInt(amount))),
    'hex'
  );

  const coin = shouldBePresent(keysignPayload.coin);

  const { blockchainSpecific } = keysignPayload;

  const { maxFeePerGasWei, priorityFee, nonce, gasLimit } =
    blockchainSpecific.value as EthereumSpecific;

  const coinType = getCoinType({
    walletCore,
    chain: coin.chain as Chain,
  });

  const input = TW.Ethereum.Proto.SigningInput.create({
    transaction: {
      erc20Approve: {
        amount: amountHex,
        spender,
      },
    },
    toAddress: shouldBePresent(keysignPayload.coin).contractAddress,
    ...getSigningInputEnvelopedTxFields({
      chain: coin.chain as Chain,
      walletCore,
      maxFeePerGasWei,
      priorityFee,
      nonce,
      gasLimit,
    }),
  });

  const encodedInput = TW.Ethereum.Proto.SigningInput.encode(input).finish();

  const preHashes = walletCore.TransactionCompiler.preImageHashes(
    coinType,
    encodedInput
  );

  const preSigningOutput =
    TW.TxCompiler.Proto.PreSigningOutput.decode(preHashes);

  return stripHexPrefix(walletCore.HexCoding.encode(preSigningOutput.dataHash));
};
