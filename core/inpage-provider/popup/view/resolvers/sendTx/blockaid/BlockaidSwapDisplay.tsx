import { Chain } from '@core/chain/Chain'
import { Coin } from '@core/chain/coin/Coin'
import {
  ContentWrapper,
  HorizontalLine,
  IconWrapper,
} from '@core/ui/vault/swap/verify/SwapVerify/SwapVerify.styled'
import { ArrowDownIcon } from '@lib/ui/icons/ArrowDownIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { formatAmount } from '@lib/utils/formatAmount'
import { formatUnits } from 'ethers'
import { useTranslation } from 'react-i18next'

import { MemoSection } from '../components/MemoSection'
import {
  NetworkFeeSection,
  NetworkFeeSectionProps,
} from '../components/NetworkFeeSection'
import { SwapAmountDisplay } from '../components/SwapAmountDisplay'

type BlockaidSwapDisplayProps = {
  swap: {
    fromCoin: Coin
    fromAmount: bigint
    toCoin: Coin
    toAmount: bigint
  }
  memo: string | undefined
  chain: Chain
  networkFeeProps: NetworkFeeSectionProps
}

export const BlockaidSwapDisplay = ({
  swap,
  memo,
  chain,
  networkFeeProps,
}: BlockaidSwapDisplayProps) => {
  const { t } = useTranslation()

  const fromCoin = swap.fromCoin
  const toCoin = swap.toCoin
  const fromAmountDecimal = formatAmount(
    Number(formatUnits(swap.fromAmount, fromCoin.decimals)),
    fromCoin
  )
  const toAmountDecimal = formatAmount(
    Number(formatUnits(swap.toAmount, toCoin.decimals)),
    toCoin
  )

  return (
    <ContentWrapper gap={24}>
      <Text color="supporting" size={15}>
        {t('youre_swapping')}
      </Text>
      <VStack gap={16}>
        <SwapAmountDisplay
          coin={fromCoin}
          amount={fromAmountDecimal}
          useRoundedIcon
        />
        <HStack alignItems="center" gap={21}>
          <IconWrapper>
            <ArrowDownIcon />
          </IconWrapper>
          <HorizontalLine />
        </HStack>
        <SwapAmountDisplay
          coin={toCoin}
          amount={toAmountDecimal}
          useRoundedIcon
        />
      </VStack>
      <MemoSection memo={memo} chain={chain} />
      <NetworkFeeSection {...networkFeeProps} />
    </ContentWrapper>
  )
}
