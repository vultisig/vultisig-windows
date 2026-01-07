import { Chain } from '@core/chain/Chain'
import { Coin } from '@core/chain/coin/Coin'
import { MemoSection } from '@core/inpage-provider/popup/view/resolvers/sendTx/components/MemoSection'
import {
  NetworkFeeSection,
  NetworkFeeSectionProps,
} from '@core/inpage-provider/popup/view/resolvers/sendTx/components/NetworkFeeSection'
import { SwapAmountDisplay } from '@core/inpage-provider/popup/view/resolvers/sendTx/components/SwapAmountDisplay'
import {
  ContainerWrapper,
  HorizontalLine,
  IconWrapper,
} from '@core/ui/vault/swap/verify/SwapVerify/SwapVerify.styled'
import { ArrowDownIcon } from '@lib/ui/icons/ArrowDownIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { formatAmount } from '@lib/utils/formatAmount'
import { formatUnits } from 'ethers'
import { useTranslation } from 'react-i18next'

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
    <>
      <ContainerWrapper radius={16}>
        <VStack bgColor="foreground" gap={24} padding={24} radius={16}>
          <Text color="supporting" size={15}>
            {t('youre_swapping')}
          </Text>
          <VStack gap={18}>
            <SwapAmountDisplay
              coin={fromCoin}
              amount={fromAmountDecimal}
              useRoundedIcon
            />
            <HStack alignItems="center" gap={10}>
              <IconWrapper>
                <ArrowDownIcon />
              </IconWrapper>
              {t('to')}
              <HorizontalLine />
            </HStack>
            <SwapAmountDisplay
              coin={toCoin}
              amount={toAmountDecimal}
              useRoundedIcon
            />
          </VStack>
        </VStack>
      </ContainerWrapper>
      <MemoSection memo={memo} chain={chain} />
      <NetworkFeeSection {...networkFeeProps} />
    </>
  )
}
