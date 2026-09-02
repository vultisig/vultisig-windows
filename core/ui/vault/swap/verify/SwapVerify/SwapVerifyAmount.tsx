import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { TokenVerificationBadge } from '@core/ui/chain/coin/verification/TokenVerificationBadge'
import { SwapVerifyFiatAmount } from '@core/ui/vault/swap/verify/SwapVerify/SwapVerifyFiatAmount'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { ReactNode } from 'react'

/** Coin icon size of a trade side, shared so a placeholder row lines up with it. */
export const swapVerifyCoinIconSize = 32

type SwapVerifyAmountProps = {
  coin: Coin
  amount: number
  /**
   * Qualifier printed above the amount — the guaranteed floor a native swap
   * carries. It sits above rather than below because it conditions the number
   * it precedes, and a signer who has already read past the amount has read
   * past the only figure the trade actually guarantees.
   */
  caption?: ReactNode
  extra?: ReactNode
}

/** One side of the trade: coin, amount, and its fiat estimate. */
export const SwapVerifyAmount = ({
  coin,
  amount,
  caption,
  extra,
}: SwapVerifyAmountProps) => (
  <HStack gap={12} alignItems="center" fullWidth>
    <CoinIcon coin={coin} style={{ fontSize: swapVerifyCoinIconSize }} />
    <VStack gap={2} flexGrow>
      {caption && (
        <Text color="shy" size={13}>
          {caption}
        </Text>
      )}
      <HStack alignItems="center" gap={6}>
        <Text weight="500" size={17} color="contrast">
          {formatAmount(amount, coin)}
        </Text>
        <TokenVerificationBadge value={coin} />
      </HStack>
      <SwapVerifyFiatAmount coin={coin} amount={amount} />
    </VStack>
    {extra}
  </HStack>
)
