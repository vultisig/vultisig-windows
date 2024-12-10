import { TW, WalletCore } from '@trustwallet/wallet-core';

import { EthereumSpecific } from '../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { Chain } from '../../../model/chain';
import { bigIntToHex } from '../../utils/bigIntToHex';
import { stripHexPrefix } from '../../utils/stripHexPrefix';
import { getCoinType } from '../../walletCore/getCoinType';

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

  console.log({
    maxFeePerGasWei,
    priorityFee,
    nonce,
    gasLimit,
  });

  const coinType = getCoinType({
    walletCore,
    chain: coin.chain as Chain,
  });

  const chain: bigint = BigInt(walletCore.CoinTypeExt.chainId(coinType));

  const padStart = coin.chain === Chain.Zksync ? 4 : 2;
  const chainHex = Buffer.from(
    stripHexPrefix(chain.toString(16).padStart(padStart, '0')),
    'hex'
  );

  const input = TW.Ethereum.Proto.SigningInput.create({
    transaction: {
      erc20Approve: {
        amount: amountHex,
        spender,
      },
    },
    toAddress: shouldBePresent(keysignPayload.coin).contractAddress,
    chainId: chainHex,
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

// var input = signingInput
// input.chainID = Data(hexString: Int64(intChainID).hexString())!
// input.nonce = Data(hexString: (nonce + incrementNonceValue).hexString())!

// if let gas, let gasPrice {
//     input.gasLimit = gas.serialize()
//     input.gasPrice = gasPrice.serialize()
//     input.txMode = .legacy
// } else {
//     input.gasLimit = gasLimit.magnitude.serialize()
//     input.maxFeePerGas = maxFeePerGasWei.magnitude.serialize()
//     input.maxInclusionFeePerGas = priorityFeeWei.magnitude.serialize()
//     input.txMode = .enveloped
// }
