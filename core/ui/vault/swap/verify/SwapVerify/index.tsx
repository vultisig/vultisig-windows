import { VStack } from '@lib/ui/layout/Stack'
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

import { KeysignReviewSheet } from '../../../../mpc/keysign/review/KeysignReviewSheet'
import { ReviewVaultLine } from '../../../../mpc/keysign/review/ReviewVaultLine'
import { useCurrentVaultCoin } from '../../../state/currentVaultCoins'
import { getSwapToAmountLimit } from '../../keysignPayload/getSwapToAmountLimit'
import { useSwapKeysignPayloadQuery } from '../../keysignPayload/query'
import { useFromAmount } from '../../state/fromAmount'
import { useSwapFromCoin } from '../../state/fromCoin'
import { useSwapToCoin } from '../../state/toCoin'
import { SwapReviewCards } from './SwapReviewCards'
import { SwapReviewFees } from './SwapReviewFees'
import { SwapReviewSide } from './SwapReviewSide'
import { SwapVerifyRecipient } from './SwapVerifyRecipient'

const swapTerms = ['input', 'output'] as const

type SwapVerifyProps = {
  swapQuote: SwapQuote
} & OnBackProp

/**
 * The market swap's review sheet, over the form that produced the quote. Every
 * figure the full-screen review showed is still here — provider, the minimum
 * payout, the fee breakdown, an external recipient — laid out as the sheet.
 */
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
  // the card does not collapse and shift everything under it.
  const renderToPlaceholder = (message: string) => (
    <Text as="span" variant="stationBodyS" color="shy" centerHorizontally>
      {message}
    </Text>
  )

  return (
    <KeysignReviewSheet
      title={t('swap_overview')}
      onClose={onBack}
      keysignPayloadQuery={keysignPayloadQuery}
      terms={translatedTerms}
      swapQuote={swapQuote}
    >
      <SwapReviewCards
        from={<SwapReviewSide coin={fromCoin} amount={fromAmountDecimal} />}
        to={
          <MatchQuery
            value={keysignPayloadQuery}
            error={() => (
              <SwapReviewSide
                coin={toCoin}
                amount={renderToPlaceholder(t('failed_to_load'))}
                withChainBadge
              />
            )}
            pending={() => (
              <SwapReviewSide
                coin={toCoin}
                amount={renderToPlaceholder(t('loading'))}
                withChainBadge
              />
            )}
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
                <SwapReviewSide
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
                  withChainBadge
                />
              )
            }}
          />
        }
      />
      <VStack gap={12}>
        <ReviewVaultLine value={fromCoin.address} />
        <SwapReviewFees swapQuote={swapQuote} />
      </VStack>
      <MatchQuery
        value={keysignPayloadQuery}
        success={keysignPayload => (
          <SwapVerifyRecipient keysignPayload={keysignPayload} />
        )}
      />
    </KeysignReviewSheet>
  )
}
