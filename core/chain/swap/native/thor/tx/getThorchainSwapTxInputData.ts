import { Chain } from '@core/chain/Chain'
import { getSigningInputEnvelopedTxFields } from '@core/chain/chains/evm/tx/getSigningInputEnvelopedTxFields'
import { toKeysignSwapPayload } from '@core/mpc/keysign/swap/KeysignSwapPayload'
import { fromCommCoin } from '@core/mpc/types/utils/commCoin'
import { EthereumSpecific } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { getDiscriminatedUnionValue } from '@lib/utils/getDiscriminatedUnionValue'
import { match } from '@lib/utils/match'
import { TW, WalletCore } from '@trustwallet/wallet-core'
import Long from 'long'

import { nativeSwapAffiliateConfig } from '../../nativeSwapAffiliateConfig'
import { toThorchainSwapAssetProto } from '../asset/toThorchainSwapAssetProto'
import { ThorchainSwapEnabledChain } from '../thorchainSwapProtoChains'

type Input = {
  keysignPayload: KeysignPayload
  walletCore: WalletCore
}

export const getThorchainSwapTxInputData = async ({
  keysignPayload,
  walletCore,
}: Input): Promise<Uint8Array> => {
  const swapPayload = getDiscriminatedUnionValue(
    toKeysignSwapPayload(keysignPayload.swapPayload),
    'case',
    'value',
    'thorchainSwapPayload'
  )

  const fromCoin = fromCommCoin(shouldBePresent(swapPayload.fromCoin))
  const fromChain = fromCoin.chain as ThorchainSwapEnabledChain

  const toCoin = fromCommCoin(shouldBePresent(swapPayload.toCoin))

  const swapInput = TW.THORChainSwap.Proto.SwapInput.create({
    fromAsset: toThorchainSwapAssetProto({
      ...fromCoin,
      direction: 'from',
    }),
    fromAddress: swapPayload.fromAddress,
    toAsset: toThorchainSwapAssetProto({
      ...toCoin,
      direction: 'to',
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
  })

  const swapInputData =
    TW.THORChainSwap.Proto.SwapInput.encode(swapInput).finish()

  const swapOutputData = walletCore.THORChainSwap.buildSwap(swapInputData)

  const swapOutput = TW.THORChainSwap.Proto.SwapOutput.decode(swapOutputData)

  if (swapOutput.error?.message) {
    throw new Error(swapOutput.error.message)
  }

  const getEvmTxInputData = () => {
    const { blockchainSpecific } = keysignPayload

    const { maxFeePerGasWei, priorityFee, nonce, gasLimit } =
      blockchainSpecific.value as EthereumSpecific

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
    })

    return TW.Ethereum.Proto.SigningInput.encode(signingInput).finish()
  }

  // Since currently only EVM chains use SwapPayload
  // we've implemented only EVM tx input data for now
  const getUtxoTxInputData = () => {
    throw new Error('Not implemented')
  }

  const getThorTxInputData = () => {
    throw new Error('Not implemented')
  }

  const getCosmosTxInputData = () => {
    throw new Error('Not implemented')
  }

  return match(fromChain as ThorchainSwapEnabledChain, {
    [Chain.THORChain]: getThorTxInputData,
    [Chain.Cosmos]: getCosmosTxInputData,
    [Chain.BitcoinCash]: getUtxoTxInputData,
    [Chain.Bitcoin]: getUtxoTxInputData,
    [Chain.Dogecoin]: getUtxoTxInputData,
    [Chain.Litecoin]: getUtxoTxInputData,
    [Chain.BSC]: getEvmTxInputData,
    [Chain.Ethereum]: getEvmTxInputData,
    [Chain.Avalanche]: getEvmTxInputData,
  })
}
