import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { VerifyKeysignStart } from '@core/ui/mpc/keysign/start/VerifyKeysignStart'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { VerifySwapFees } from '@core/ui/vault/swap/form/info/VerifySwapFees'
import { getSwapToAmountLimit } from '@core/ui/vault/swap/keysignPayload/getSwapToAmountLimit'
import { useSwapKeysignPayloadQuery } from '@core/ui/vault/swap/keysignPayload/query'
import { useFromAmount } from '@core/ui/vault/swap/state/fromAmount'
import { useSwapFromCoin } from '@core/ui/vault/swap/state/fromCoin'
import { useSwapToCoin } from '@core/ui/vault/swap/state/toCoin'
import {
  SwapVerifyAmount,
  swapVerifyCoinIconSize,
} from '@core/ui/vault/swap/verify/SwapVerify/SwapVerifyAmount'
import { SwapVerifyCard } from '@core/ui/vault/swap/verify/SwapVerify/SwapVerifyCard'
import { SwapVerifyChainChip } from '@core/ui/vault/swap/verify/SwapVerify/SwapVerifyChainChip'
import { SwapVerifyRecipient } from '@core/ui/vault/swap/verify/SwapVerify/SwapVerifyRecipient'
import { SwapVerifyToDivider } from '@core/ui/vault/swap/verify/SwapVerify/SwapVerifyToDivider'
import { SwapVerifyVaultRow } from '@core/ui/vault/swap/verify/SwapVerify/SwapVerifyVaultRow'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnBackProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { SwapQuote } from '@vultisig/core-chain/swap/quote/SwapQuote'
import { getKeysignSwapPayload } from '@vultisig/core-mpc/keysign/swap/getKeysignSwapPayload'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { getRecordUnionValue } from '@vultisig/lib-utils/record/union/getRecordUnionValue'
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

  const fromAmountDecimal = fromChainAmount(
    shouldBePresent(fromAmount, 'fromAmount'),
    fromCoin.decimals
  )

  // Keeps the payout coin on screen while its amount is still resolving, so
  // the card does not collapse to a bare line and shift everything under it.
  const renderToPlaceholder = (message: string) => (
    <HStack gap={12} alignItems="center">
      <CoinIcon coin={toCoin} style={{ fontSize: swapVerifyCoinIconSize }} />
      <Text color="shy" size={15}>
        {message}
      </Text>
    </HStack>
  )

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
        swapQuote={swapQuote}
      >
        <SwapVerifyCard>
          <VStack gap={24} padding={24}>
            <Text color="supporting" size={15}>
              {t('youre_swapping')}
            </Text>
            <VStack gap={16}>
              <SwapVerifyAmount coin={fromCoin} amount={fromAmountDecimal} />
              <SwapVerifyToDivider />
              <MatchQuery
                value={keysignPayloadQuery}
                error={() => renderToPlaceholder(t('failed_to_load'))}
                pending={() => renderToPlaceholder(t('loading'))}
                success={keysignPayload => {
                  const swapPayload = shouldBePresent(
                    getKeysignSwapPayload(keysignPayload),
                    'swap payload'
                  )
                  const { toAmountDecimal } = getRecordUnionValue(swapPayload)
                  const toAmountLimit = getSwapToAmountLimit({
                    swapPayload,
                    toCoin,
                  })

                  return (
                    <SwapVerifyAmount
                      coin={toCoin}
                      amount={parseFloat(toAmountDecimal)}
                      caption={
                        toAmountLimit === null
                          ? undefined
                          : `${t('to_min_payout')}: ${formatAmount(
                              toAmountLimit,
                              toCoin
                            )}`
                      }
                      extra={<SwapVerifyChainChip value={toCoin.chain} />}
                    />
                  )
                }}
              />
            </VStack>
          </VStack>
          <SwapVerifyVaultRow value={fromCoin.address} />
          <VerifySwapFees swapQuote={swapQuote} />
        </SwapVerifyCard>
        <MatchQuery
          value={keysignPayloadQuery}
          success={keysignPayload => (
            <SwapVerifyRecipient keysignPayload={keysignPayload} />
          )}
        />
      </VerifyKeysignStart>
    </>
  )
}
