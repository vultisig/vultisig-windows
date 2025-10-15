import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { ArrowDownIcon } from '@lib/ui/icons/ArrowDownIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { formatAmount } from '@lib/utils/formatAmount'
import { useTranslation } from 'react-i18next'

import { VerifyKeysignStart } from '../../../../mpc/keysign/start/VerifyKeysignStart'
import { VerifySwapFees } from '../../form/info/VerifySwapFees'
import { useSwapKeysignPayloadQuery } from '../../queries/useSwapKeysignPayloadQuery'
import { useSwapOutputAmountQuery } from '../../queries/useSwapOutputAmountQuery'
import { useFromAmount } from '../../state/fromAmount'
import { useSwapFromCoin } from '../../state/fromCoin'
import { useSwapToCoin } from '../../state/toCoin'
import {
  ContentWrapper,
  HorizontalLine,
  IconWrapper,
  SwapTxFeesOverviewRow,
} from './SwapVerify.styled'

const swapTerms = ['input', 'output'] as const

export const SwapVerify = () => {
  const { t } = useTranslation()
  const [fromCoinKey] = useSwapFromCoin()
  const [toCoinKey] = useSwapToCoin()
  const fromCoin = useCurrentVaultCoin(fromCoinKey)
  const toCoin = useCurrentVaultCoin(toCoinKey)
  const [fromAmount] = useFromAmount()
  const outAmountQuery = useSwapOutputAmountQuery()
  const keysignPayloadQuery = useSwapKeysignPayloadQuery()

  const translatedTerms = swapTerms.map(term => t(`swap_terms.${term}`))

  return (
    <VerifyKeysignStart
      keysignPayloadQuery={keysignPayloadQuery}
      terms={translatedTerms}
    >
      <ContentWrapper gap={24}>
        <Text color="supporting" size={15}>
          {t('youre_swapping')}
        </Text>
        <VStack gap={16}>
          <HStack gap={8}>
            <CoinIcon coin={fromCoin} style={{ fontSize: 24 }} />
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
            <CoinIcon coin={toCoin} style={{ fontSize: 24 }} />
            <MatchQuery
              value={outAmountQuery}
              error={() => t('failed_to_load')}
              pending={() => t('loading')}
              success={amount => (
                <Text weight="500" size={17} color="contrast">
                  {formatAmount(amount, toCoin)}
                </Text>
              )}
            />
          </HStack>
        </VStack>
        <VerifySwapFees RowComponent={SwapTxFeesOverviewRow} />
      </ContentWrapper>
    </VerifyKeysignStart>
  )
}
