import { getBlockExplorerUrl } from '@vultisig/core-chain/utils/getBlockExplorerUrl'
import { getKeysignSwapPayload } from '@vultisig/core-mpc/keysign/swap/getKeysignSwapPayload'
import { getKeysignSwapProviderName } from '@vultisig/core-mpc/keysign/swap/getKeysignSwapProviderName'
import { getKeysignChain } from '@vultisig/core-mpc/keysign/utils/getKeysignChain'
import { getKeysignCoin } from '@vultisig/core-mpc/keysign/utils/getKeysignCoin'
import { fromCommCoin } from '@vultisig/core-mpc/types/utils/commCoin'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'

import {
  SendTransactionData,
  SendTransactionRecord,
  SwapTransactionData,
  SwapTransactionRecord,
  TransactionRecord,
} from '../core'

type CreateTransactionRecordInput = {
  payload: KeysignPayload
  txHash: string
  vaultId: string
}

const emptyLogoFallback = ''

const createSendData = (payload: KeysignPayload): SendTransactionData => {
  const coin = getKeysignCoin(payload)

  return {
    fromAddress: coin.address,
    toAddress: payload.toAddress,
    amount: payload.toAmount,
    token: coin.ticker,
    tokenLogo: coin.logo ?? emptyLogoFallback,
    tokenId: coin.id,
    decimals: coin.decimals,
    memo: payload.memo || undefined,
  }
}

const coinFromCommCoin = (coin: Parameters<typeof fromCommCoin>[0]) => {
  const accountCoin = fromCommCoin(coin)
  return {
    token: accountCoin.ticker,
    tokenLogo: accountCoin.logo ?? emptyLogoFallback,
    tokenId: accountCoin.id,
    chain: accountCoin.chain,
    decimals: accountCoin.decimals,
  }
}

const createSwapData = (payload: KeysignPayload): SwapTransactionData => {
  const swapPayload = shouldBePresent(
    getKeysignSwapPayload(payload),
    'swap payload for swap transaction'
  )

  const provider = getKeysignSwapProviderName(swapPayload)

  return matchRecordUnion(swapPayload, {
    native: (native): SwapTransactionData => {
      const from = coinFromCommCoin(
        shouldBePresent(native.fromCoin, 'native swap fromCoin')
      )
      const to = coinFromCommCoin(
        shouldBePresent(native.toCoin, 'native swap toCoin')
      )

      return {
        fromToken: from.token,
        fromAmount: native.fromAmount,
        fromChain: from.chain,
        fromTokenLogo: from.tokenLogo,
        fromTokenId: from.tokenId,
        fromDecimals: from.decimals,
        toToken: to.token,
        toAmount: native.toAmountDecimal,
        toChain: to.chain,
        toTokenLogo: to.tokenLogo,
        toTokenId: to.tokenId,
        toDecimals: to.decimals,
        provider,
      }
    },
    general: (general): SwapTransactionData => {
      const from = coinFromCommCoin(
        shouldBePresent(general.fromCoin, 'general swap fromCoin')
      )
      const to = coinFromCommCoin(
        shouldBePresent(general.toCoin, 'general swap toCoin')
      )

      return {
        fromToken: from.token,
        fromAmount: general.fromAmount,
        fromChain: from.chain,
        fromTokenLogo: from.tokenLogo,
        fromTokenId: from.tokenId,
        fromDecimals: from.decimals,
        toToken: to.token,
        toAmount: general.toAmountDecimal,
        toChain: to.chain,
        toTokenLogo: to.tokenLogo,
        toTokenId: to.tokenId,
        toDecimals: to.decimals,
        provider,
      }
    },
  })
}

export const createTransactionRecord = ({
  payload,
  txHash,
  vaultId,
}: CreateTransactionRecordInput): TransactionRecord => {
  const chain = getKeysignChain(payload)
  const explorerUrl = getBlockExplorerUrl({
    chain,
    entity: 'tx',
    value: txHash,
  })
  const timestamp = new Date().toISOString()
  const id = `${txHash}-${timestamp}`

  const isSwapTx = payload.swapPayload?.case && payload.swapPayload.value

  const base = {
    id,
    vaultId,
    chain,
    timestamp,
    txHash,
    explorerUrl,
    fiatValue: '',
    status: 'broadcasted' as const,
  }

  if (isSwapTx) {
    return {
      ...base,
      type: 'swap',
      data: createSwapData(payload),
    } satisfies SwapTransactionRecord
  }

  return {
    ...base,
    type: 'send',
    data: createSendData(payload),
  } satisfies SendTransactionRecord
}
