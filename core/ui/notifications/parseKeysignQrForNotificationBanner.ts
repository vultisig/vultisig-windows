import { parseDeeplink } from '@core/ui/deeplink/core'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import type { Coin } from '@vultisig/core-mpc/types/vultisig/keysign/v1/coin_pb'
import type { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { matchDiscriminatedUnion } from '@vultisig/lib-utils/matchDiscriminatedUnion'

/** Parsed keysign QR / deeplink data for the in-app notification banner. */
type KeysignNotificationBannerParseResult = {
  /** Initiator party id when present; used to hide the banner on the sender device. */
  initiatorPartyId: string | null
  /** Single-line transaction summary (swap/send) or generic copy. */
  description: string
}

const formatAmountWithTicker = (input: {
  rawAmount: string
  coin: Coin | undefined
}): string => {
  const { rawAmount, coin } = input
  if (!coin?.ticker) {
    return rawAmount
  }
  try {
    const amount = fromChainAmount(BigInt(rawAmount), coin.decimals)
    const fixed = amount.toFixed(Math.min(8, Math.max(0, coin.decimals)))
    const trimmed = fixed.replace(/\.?0+$/, '')
    return `${trimmed} ${coin.ticker}`
  } catch {
    return `${rawAmount} ${coin.ticker}`
  }
}

type SwapCoinRow = {
  fromAmount: string
  fromCoin: Coin | undefined
  toCoin: Coin | undefined
}

const extractSwapCoins = (
  swapPayload: KeysignPayload['swapPayload']
): { fromCoin: Coin; toCoin: Coin; fromAmount: string } | null => {
  if (!swapPayload?.case || !swapPayload.value) {
    return null
  }
  const row: SwapCoinRow = matchDiscriminatedUnion(
    swapPayload,
    'case',
    'value',
    {
      thorchainSwapPayload: v => ({
        fromCoin: v.fromCoin,
        toCoin: v.toCoin,
        fromAmount: v.fromAmount,
      }),
      mayachainSwapPayload: v => ({
        fromCoin: v.fromCoin,
        toCoin: v.toCoin,
        fromAmount: v.fromAmount,
      }),
      oneinchSwapPayload: v => ({
        fromCoin: v.fromCoin,
        toCoin: v.toCoin,
        fromAmount: v.fromAmount,
      }),
      kyberswapSwapPayload: v => ({
        fromCoin: v.fromCoin,
        toCoin: v.toCoin,
        fromAmount: v.fromAmount,
      }),
    }
  )
  if (!row.fromCoin?.ticker || !row.toCoin?.ticker) {
    return null
  }
  return {
    fromCoin: row.fromCoin,
    toCoin: row.toCoin,
    fromAmount: row.fromAmount,
  }
}

/**
 * Decodes a keysign deeplink and builds banner copy aligned with iOS
 * {@code ForegroundNotificationParser}.
 */
export const parseKeysignQrForNotificationBanner = async (input: {
  qrCodeData: string
  t: {
    foreground_notification_swap: (v: { from: string; to: string }) => string
    foreground_notification_send: (v: { amount: string }) => string
    foreground_notification_generic: () => string
  }
}): Promise<KeysignNotificationBannerParseResult | null> => {
  const { qrCodeData, t } = input

  let parsed: Awaited<ReturnType<typeof parseDeeplink>>
  try {
    parsed = await parseDeeplink(qrCodeData)
  } catch {
    return null
  }

  if (!('signTransaction' in parsed)) {
    return null
  }

  const { keysignMsg } = parsed.signTransaction

  if (keysignMsg.customMessagePayload) {
    return {
      initiatorPartyId: null,
      description: t.foreground_notification_generic(),
    }
  }

  const payload = keysignMsg.keysignPayload
  if (!payload) {
    return {
      initiatorPartyId: null,
      description: t.foreground_notification_generic(),
    }
  }

  const initiatorPartyId = payload.vaultLocalPartyId || null

  const swap = extractSwapCoins(payload.swapPayload)
  if (swap) {
    const from = formatAmountWithTicker({
      rawAmount: swap.fromAmount,
      coin: swap.fromCoin,
    })
    const toTicker = swap.toCoin.ticker
    return {
      initiatorPartyId,
      description: t.foreground_notification_swap({ from, to: toTicker }),
    }
  }

  const coin = payload.coin
  if (coin) {
    const amount = formatAmountWithTicker({
      rawAmount: payload.toAmount,
      coin,
    })
    return {
      initiatorPartyId,
      description: t.foreground_notification_send({ amount }),
    }
  }

  return {
    initiatorPartyId,
    description: t.foreground_notification_generic(),
  }
}
