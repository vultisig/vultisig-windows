import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { SwapQuote } from '@core/chain/swap/quote/SwapQuote'
import { getKeysignSwapPayload } from '@core/mpc/keysign/swap/getKeysignSwapPayload'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { VerifyKeysignStart } from '@core/ui/mpc/keysign/start/VerifyKeysignStart'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { SwapFiatAmount } from '@core/ui/vault/swap/form/amount/SwapFiatAmount'
import { VerifySwapFees } from '@core/ui/vault/swap/form/info/VerifySwapFees'
import { useSwapKeysignPayloadQuery } from '@core/ui/vault/swap/keysignPayload/query'
import { useFromAmount } from '@core/ui/vault/swap/state/fromAmount'
import { useSwapFromCoin } from '@core/ui/vault/swap/state/fromCoin'
import { useSwapToCoin } from '@core/ui/vault/swap/state/toCoin'
import {
  ContainerWrapper,
  HorizontalLine,
  IconWrapper,
} from '@core/ui/vault/swap/verify/SwapVerify/SwapVerify.styled'
import { ArrowDownIcon } from '@lib/ui/icons/ArrowDownIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnBackProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { formatAmount } from '@lib/utils/formatAmount'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { useTranslation } from 'react-i18next'

const swapTerms = ['input', 'output'] as const

type SwapVerifyProps = {
  swapQuote: SwapQuote
} & OnBackProp

export const SwapVerify = ({ swapQuote, onBack }: SwapVerifyProps) => {
  const { t } = useTranslation()
  const [fromCoinKey] = useSwapFromCoin()
  const [toCoinKey] = useSwapToCoin()
  const fromCoin = useCurrentVaultCoin(fromCoinKey)
  const toCoin = useCurrentVaultCoin(toCoinKey)
  const [fromAmount] = useFromAmount()
  const keysignPayloadQuery = useSwapKeysignPayloadQuery(swapQuote)

  const translatedTerms = swapTerms.map(term => t(`swap_terms.${term}`))

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        title={t('swap_overview')}
        hasBorder
      />
      <VerifyKeysignStart
        keysignPayloadQuery={keysignPayloadQuery}
        terms={translatedTerms}
      >
        <ContainerWrapper radius={16}>
          <VStack bgColor="foreground" gap={24} padding={24} radius={16}>
            <Text color="supporting" size={15}>
              {t('youre_swapping')}
            </Text>
            <VStack gap={16}>
              <HStack gap={8}>
                <CoinIcon coin={fromCoin} style={{ fontSize: 24 }} />
                <VStack>
                  <Text weight="500" size={17} color="contrast">
                    {formatAmount(
                      fromChainAmount(
                        shouldBePresent(fromAmount, 'fromAmount'),
                        fromCoin.decimals
                      ),
                      fromCoin
                    )}
                  </Text>
                  <SwapFiatAmount
                    value={{
                      ...fromCoinKey,
                      amount: fromChainAmount(
                        shouldBePresent(fromAmount, 'fromAmount'),
                        fromCoin.decimals
                      ),
                    }}
                  />
                </VStack>
              </HStack>
              <HStack alignItems="center" gap={10}>
                <IconWrapper>
                  <ArrowDownIcon />
                </IconWrapper>
                {t('to')}
                <HorizontalLine />
              </HStack>
              <HStack gap={8}>
                <CoinIcon coin={toCoin} style={{ fontSize: 24 }} />
                <MatchQuery
                  value={keysignPayloadQuery}
                  error={() => t('failed_to_load')}
                  pending={() => t('loading')}
                  success={keysignPayload => {
                    const swapPayload = shouldBePresent(
                      getKeysignSwapPayload(keysignPayload),
                      'swap payload'
                    )
                    const { toAmountDecimal } = getRecordUnionValue(swapPayload)

                    return (
                      <VStack>
                        <Text weight="500" size={17} color="contrast">
                          {formatAmount(parseFloat(toAmountDecimal), toCoin)}
                        </Text>
                        <SwapFiatAmount
                          value={{
                            ...toCoin,
                            amount: parseFloat(toAmountDecimal),
                          }}
                        />
                      </VStack>
                    )
                  }}
                />
              </HStack>
            </VStack>
          </VStack>
        </ContainerWrapper>
        <VStack bgColor="foreground" gap={24} padding={12} radius={16}>
          <VerifySwapFees swapQuote={swapQuote} />
        </VStack>
      </VerifyKeysignStart>
    </>
  )
}
