import { Chain } from '@vultisig/core-chain/Chain'
import { decodeCowSwapKeysignData } from '@vultisig/core-chain/swap/general/cowswap/keysign/cowSwapKeysignData'
import { getBlockExplorerUrl } from '@vultisig/core-chain/utils/getBlockExplorerUrl'
import { getKeysignSwapPayload } from '@vultisig/core-mpc/keysign/swap/getKeysignSwapPayload'
import { getKeysignSwapProviderName } from '@vultisig/core-mpc/keysign/swap/getKeysignSwapProviderName'
import { KeysignSwapPayload } from '@vultisig/core-mpc/keysign/swap/KeysignSwapPayload'
import { getKeysignChain } from '@vultisig/core-mpc/keysign/utils/getKeysignChain'
import { getKeysignCoin } from '@vultisig/core-mpc/keysign/utils/getKeysignCoin'
import { getSwapTrackingUrl } from '@vultisig/core-mpc/swap/utils/getSwapTrackingUrl'
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
import { getPrimaryCosmosMessageTypeUrl } from './getPrimaryCosmosMessageTypeUrl'

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
    messageTypeUrl: getPrimaryCosmosMessageTypeUrl(payload),
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
        toAmountLimit: native.toAmountLimit,
        toChain: to.chain,
        toTokenLogo: to.tokenLogo,
        toTokenId: to.tokenId,
        toDecimals: to.decimals,
        provider,
        route: `${from.token} → ${to.token}`,
      }
    },
    general: (general): SwapTransactionData => {
      const from = coinFromCommCoin(
        shouldBePresent(general.fromCoin, 'general swap fromCoin')
      )
      const to = coinFromCommCoin(
        shouldBePresent(general.toCoin, 'general swap toCoin')
      )

      // CowSwap orders carry their orderbook API base in the (otherwise unused
      // for off-chain orders) tx.data field — surface it so the status poller
      // can poll the order by UID.
      const cowSwapData =
        general.provider === 'cowswap'
          ? decodeCowSwapKeysignData(general.quote?.tx?.data ?? '')
          : null

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
        route: `${from.token} → ${to.token}`,
        ...(cowSwapData ? { cowSwapOrderApiBase: cowSwapData.apiBase } : {}),
      }
    },
  })
}

/** Returns the chain associated with transaction status and record metadata. */
const getSwapExplorerChain = (
  swapPayload: KeysignSwapPayload,
  sourceChain: Chain
): Chain =>
  matchRecordUnion(swapPayload, {
    native: ({ chain }) => chain,
    general: () => sourceChain,
  })

export const createTransactionRecord = ({
  payload,
  txHash,
  vaultId,
}: CreateTransactionRecordInput): TransactionRecord => {
  const sourceChain = getKeysignChain(payload)
  const timestamp = new Date().toISOString()
  const id = `${txHash}-${timestamp}`

  const swapPayload = getKeysignSwapPayload(payload)
  const isSwapTx = swapPayload != null

  const explorerChain = isSwapTx
    ? getSwapExplorerChain(swapPayload, sourceChain)
    : sourceChain

  const explorerUrl =
    swapPayload != null
      ? getSwapTrackingUrl({
          swapPayload,
          txHash,
          sourceChain,
        })
      : getBlockExplorerUrl({
          chain: explorerChain,
          entity: 'tx',
          value: txHash,
        })

  const base = {
    id,
    vaultId,
    chain: explorerChain,
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
