import { TW, WalletCore } from '@trustwallet/wallet-core';
import Long from 'long';

import { getCoinKey } from '../../../../../coin/utils/coin';
import { EthereumSpecific } from '../../../../../gen/vultisig/keysign/v1/blockchain_specific_pb';
import { KeysignPayload } from '../../../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { THORChainSwapPayload } from '../../../../../gen/vultisig/keysign/v1/thorchain_swap_payload_pb';
import { shouldBePresent } from '../../../../../lib/utils/assert/shouldBePresent';
import { match } from '../../../../../lib/utils/match';
import { Chain } from '../../../../../model/chain';
import { evmSigningInputToPreSignedImageHash } from '../../../../evm/tx/evmSigningInputToPreSignedImageHash';
import { getSigningInputEnvelopedTxFields } from '../../../../evm/tx/getSigningInputEnvelopedTxFields';
import { nativeSwapAffiliateConfig } from '../../nativeSwapAffiliateConfig';
import { toThorchainSwapAssetProto } from '../asset/toThorchainSwapAssetProto';
import { ThorchainSwapEnabledChain } from '../thorchainSwapProtoChains';

type Input = {
  keysignPayload: KeysignPayload;
  walletCore: WalletCore;
};

export const getThorchainSwapPreSignedImageHashes = async ({
  keysignPayload,
  walletCore,
}: Input): Promise<string[]> => {
  const swapPayload = shouldBePresent(keysignPayload.swapPayload)
    .value as THORChainSwapPayload;

  const fromCoin = shouldBePresent(swapPayload.fromCoin);
  const fromChain = fromCoin.chain as ThorchainSwapEnabledChain;

  const toCoin = shouldBePresent(swapPayload.toCoin);

  const swapInput = TW.THORChainSwap.Proto.SwapInput.create({
    fromAsset: toThorchainSwapAssetProto({
      ...getCoinKey(fromCoin),
      direction: 'from',
      ticker: fromCoin.ticker,
    }),
    fromAddress: swapPayload.fromAddress,
    toAsset: toThorchainSwapAssetProto({
      ...getCoinKey(toCoin),
      direction: 'to',
      ticker: toCoin.ticker,
    }),
    toAddress: swapPayload.toCoin?.address,
    vaultAddress: swapPayload.vaultAddress,
    routerAddress: swapPayload.routerAddress,
    fromAmount: swapPayload.fromAmount,
    toAmountLimit: swapPayload.toAmountLimit,
    expirationTime: new Long(Number(swapPayload.expirationTime)),
    streamParams: {
      interval: swapPayload.streamingInterval,
      quantity: swapPayload.streamingQuantity,
    },
    ...(swapPayload.isAffiliate
      ? {
          affiliateFeeAddress: nativeSwapAffiliateConfig.affiliateFeeAddress,
          affiliateFeeRateBps: nativeSwapAffiliateConfig.affiliateFeeRateBps,
        }
      : {}),
  });

  const swapInputData =
    TW.THORChainSwap.Proto.SwapInput.encode(swapInput).finish();

  const swapOutputData = walletCore.THORChainSwap.buildSwap(swapInputData);

  const swapOutput = TW.THORChainSwap.Proto.SwapOutput.decode(swapOutputData);

  if (swapOutput.error?.message) {
    throw new Error(swapOutput.error.message);
  }

  const getEvmHashes = () => {
    const { blockchainSpecific } = keysignPayload;

    const { maxFeePerGasWei, priorityFee, nonce, gasLimit } =
      blockchainSpecific.value as EthereumSpecific;

    const signingInput = TW.Ethereum.Proto.SigningInput.create({
      ...shouldBePresent(swapOutput.ethereum),
      ...getSigningInputEnvelopedTxFields({
        chain: fromChain,
        walletCore,
        maxFeePerGasWei,
        priorityFee,
        nonce,
        gasLimit,
      }),
    });

    return [
      evmSigningInputToPreSignedImageHash({
        signingInput,
        walletCore,
        chain: fromChain,
      }),
    ];
  };

  // Since currently only EVM chains use SwapPayload
  // we've implemented only EVM tx input data for now
  const getUtxoHashes = () => {
    throw new Error('Not implemented');
  };

  const getThorHashes = () => {
    throw new Error('Not implemented');
  };

  const getCosmosHashes = () => {
    throw new Error('Not implemented');
  };

  return match(fromChain as ThorchainSwapEnabledChain, {
    [Chain.THORChain]: getThorHashes,
    [Chain.Cosmos]: getCosmosHashes,
    [Chain.BitcoinCash]: getUtxoHashes,
    [Chain.Bitcoin]: getUtxoHashes,
    [Chain.Dogecoin]: getUtxoHashes,
    [Chain.Litecoin]: getUtxoHashes,
    [Chain.BSC]: getEvmHashes,
    [Chain.Ethereum]: getEvmHashes,
    [Chain.Avalanche]: getEvmHashes,
  });
};
