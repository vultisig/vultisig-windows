import { ChainCoinIcon } from '@core/ui/chain/coin/icon/ChainCoinIcon'
import { getCoinLogoSrc } from '@core/ui/chain/coin/icon/utils/getCoinLogoSrc'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { ArrowDownIcon } from '@lib/ui/icons/ArrowDownIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { formatTokenAmount } from '@lib/utils/formatTokenAmount'
import { useTranslation } from 'react-i18next'

import { VerifySwapFees } from '../../form/info/VerifySwapFees'
import { useSwapOutputAmountQuery } from '../../queries/useSwapOutputAmountQuery'
import { useFromAmount } from '../../state/fromAmount'
import { useFromCoin } from '../../state/fromCoin'
import { useToCoin } from '../../state/toCoin'
import { swapTerms, SwapTermsProvider } from '../state/swapTerms'
import { SwapAllowance } from '../SwapAllowance'
import { SwapConfirm } from '../SwapConfirm'
import { SwapTerms } from '../SwapTerms'
import {
  ContentWrapper,
  HorizontalLine,
  IconWrapper,
  SwapTxFeesOverviewRow,
} from './SwapVerify.styled'

export const SwapVerify = () => {
  const { t } = useTranslation()
  const [fromCoinKey] = useFromCoin()
  const [toCoinKey] = useToCoin()
  const fromCoin = useCurrentVaultCoin(fromCoinKey)
  const toCoin = useCurrentVaultCoin(toCoinKey)
  const [fromAmount] = useFromAmount()
  const outAmountQuery = useSwapOutputAmountQuery()

  return (
    <PageContent gap={40} justifyContent="space-between">
      <ContentWrapper gap={24}>
        <Text color="supporting" size={15}>
          {t('youre_swapping')}
        </Text>
        <VStack gap={16}>
          <HStack gap={8}>
            <ChainCoinIcon
              coinSrc={getCoinLogoSrc(fromCoin.logo)}
              style={{ fontSize: 24 }}
            />
            <Text weight="500" size={17} color="contrast">
              {fromAmount}{' '}
              <Text as="span" color="shy" size={17}>
                {fromCoin.ticker.toUpperCase()}
              </Text>
            </Text>
          </HStack>
          <HStack alignItems="center" gap={21}>
            <IconWrapper>
              <ArrowDownIcon />
            </IconWrapper>
            <HorizontalLine />
          </HStack>
          <HStack gap={8}>
            <ChainCoinIcon
              coinSrc={getCoinLogoSrc(toCoin.logo)}
              style={{ fontSize: 24 }}
            />
            <MatchQuery
              value={outAmountQuery}
              error={() => t('failed_to_load')}
              pending={() => t('loading')}
              success={amount => (
                <Text weight="500" size={17} color="contrast">
                  {formatTokenAmount(amount)}{' '}
                  <Text as="span" color="shy" size={17}>
                    {toCoin.ticker.toUpperCase()}
                  </Text>
                </Text>
              )}
            />
          </HStack>
        </VStack>
        <SwapAllowance />
        <VerifySwapFees RowComponent={SwapTxFeesOverviewRow} />
      </ContentWrapper>
      <SwapTermsProvider initialValue={swapTerms.map(() => false)}>
        <VStack gap={20}>
          <SwapTerms />
          <SwapConfirm />
        </VStack>
      </SwapTermsProvider>
    </PageContent>
  )
}
