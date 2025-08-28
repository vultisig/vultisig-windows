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

import { useCreateReferralForm } from '../../../../providers/CreateReferralFormProvider'
import { useReferralPayoutAsset } from '../../../../providers/ReferralPayoutAssetProvider'
import { useTnsFeesQuery } from '../../../../queries/useTnsFeesQuery'

const debounceDelayMs = 300

export const Fees = () => {
  const { t } = useTranslation()
  const { watch, setValue } = useCreateReferralForm()
  const referralFeeAmount = watch('referralFeeAmount')
  const expiration = watch('expiration')
  const debouncedExpiration = useDebounce(expiration, debounceDelayMs)
  const tnsFees = useTnsFeesQuery(debouncedExpiration)
  const currency = useFiatCurrency()
  const [coin] = useReferralPayoutAsset()
  const coinPrice = useCoinPriceQuery({
    coin,
  })

  const query = useMergeQueries({
    coinPrice,
    tnsFees,
  })

  return (
    <VStack
      style={{
        position: 'relative',
      }}
      gap={14}
    >
      <MatchQuery
        value={query}
        error={error => (
          <CenterAbsolutely>{extractErrorMsg(error)}</CenterAbsolutely>
        )}
        pending={() => (
          <CenterAbsolutely>
            <Spinner size="1.5em" />
          </CenterAbsolutely>
        )}
        success={({ coinPrice, tnsFees: { registerFee, runeFee } }) => {
          if (referralFeeAmount !== runeFee) {
            setValue('referralFeeAmount', runeFee, {
              shouldValidate: true,
            })
          }

          const yearlyFee = (runeFee - registerFee) / debouncedExpiration
          const registerFeeFiat = formatAmount(
            registerFee * coinPrice,
            currency
          )

          const yearlyFeeFiat = formatAmount(
            yearlyFee * debouncedExpiration * coinPrice,
            currency
          )

          return (
            <>
              {/* Registration fee row */}
              <RowWrapper>
                <Text size={13} color="supporting">
                  {t('referral_reg_fee')}
                </Text>
                <VStack alignItems="flex-end">
                  <Text size={14}>
                    {formatTokenAmount(registerFee, 'RUNE')}
                  </Text>
                  <Text size={14} color="supporting">
                    {registerFeeFiat}
                  </Text>
                </VStack>
              </RowWrapper>

              {/* Costs row – now shows years × 1 RUNE */}
              <RowWrapper>
                <Text size={13} color="supporting">
                  {t('referral_costs')}
                </Text>
                <VStack alignItems="flex-end">
                  <Text size={14}>
                    {debouncedExpiration} ×{' '}
                    {formatTokenAmount(yearlyFee, 'RUNE')}
                  </Text>
                  <Text size={14} color="supporting">
                    {yearlyFeeFiat}
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
  ${hStack({
    justifyContent: 'space-between',
    alignItems: 'center',
  })}
`
