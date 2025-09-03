import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { useFiatCurrency } from '@core/ui/storage/fiatCurrency'
import { useDebounce } from '@lib/ui/hooks/useDebounce'
import { CenterAbsolutely } from '@lib/ui/layout/CenterAbsolutely'
import { hStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useMergeQueries } from '@lib/ui/query/hooks/useMergeQueries'
import { Text } from '@lib/ui/text'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { formatAmount } from '@lib/utils/formatAmount'
import { formatTokenAmount } from '@lib/utils/formatTokenAmount'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useEditReferralFormData } from '../../../../providers/EditReferralFormProvider'
import { useTnsFeesQuery } from '../../../../queries/useTnsFeesQuery'
import { useUserValidThorchainNameQuery } from '../../../../queries/useUserValidThorchainNameQuery'

export const Fees = () => {
  const { t } = useTranslation()
  const { watch, setValue } = useEditReferralFormData()
  const existing = useUserValidThorchainNameQuery()
  const runeCoin = chainFeeCoin.THORChain
  const runePrice = useCoinPriceQuery({ coin: runeCoin })
  const currency = useFiatCurrency()

  const requestedYears = useDebounce(watch('expiration'), 300)

  const tnsFees1y = useTnsFeesQuery(1)

  const query = useMergeQueries({ runePrice, existing, tnsFees: tnsFees1y })

  return (
    <VStack style={{ position: 'relative' }} gap={14}>
      <MatchQuery
        value={query}
        pending={() => (
          <CenterAbsolutely>
            <Spinner size="1.5em" />
          </CenterAbsolutely>
        )}
        error={err => (
          <CenterAbsolutely>{extractErrorMsg(err)}</CenterAbsolutely>
        )}
        success={({
          runePrice,
          existing: valid,
          tnsFees: { registerFee, runeFee },
        }) => {
          const remaining = valid?.remainingYears ?? 0
          const yearsToAdd = Math.max(0, Math.ceil(requestedYears - remaining))
          const perYearFee = runeFee - registerFee
          const extensionFee = perYearFee * yearsToAdd

          if (watch('referralFeeAmount') !== extensionFee) {
            setValue('referralFeeAmount', extensionFee, {
              shouldValidate: true,
            })
          }

          const perYearFiat = formatAmount(perYearFee * runePrice, currency)
          const totalFiat = formatAmount(extensionFee * runePrice, currency)

          return (
            <>
              <RowWrapper>
                <Text size={13} color="supporting">
                  {t('current_expiry')}
                </Text>
                <Text size={14}>{Math.ceil(remaining)} yrs</Text>
              </RowWrapper>

              <RowWrapper>
                <Text size={13} color="supporting">
                  {t('referral_annual_fee')}
                </Text>
                <VStack alignItems="flex-end">
                  <Text size={14}>
                    {formatTokenAmount(perYearFee, 'RUNE')} / yr
                  </Text>
                  <Text size={14} color="supporting">
                    {perYearFiat}
                  </Text>
                </VStack>
              </RowWrapper>

              <RowWrapper>
                <Text size={13} color="supporting">
                  {t('referral_extension_fee', { years: yearsToAdd })}
                </Text>
                <VStack alignItems="flex-end">
                  <Text size={14}>
                    {formatTokenAmount(extensionFee, 'RUNE')}
                  </Text>
                  <Text size={14} color="supporting">
                    {totalFiat}
                  </Text>
                </VStack>
              </RowWrapper>
            </>
          )
        }}
      />
    </VStack>
  )
}

const RowWrapper = styled.div`
  ${hStack({ justifyContent: 'space-between', alignItems: 'center' })}
`
