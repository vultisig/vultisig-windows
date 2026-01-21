import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { useDebounce } from '@lib/ui/hooks/useDebounce'
import { CenterAbsolutely } from '@lib/ui/layout/CenterAbsolutely'
import { hStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useMergeQueries } from '@lib/ui/query/hooks/useMergeQueries'
import { Text } from '@lib/ui/text'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { formatAmount } from '@lib/utils/formatAmount'
import { useEffect, useMemo } from 'react'
import { useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useFormatFiatAmount } from '../../../../../../../chain/hooks/useFormatFiatAmount'
import { useCreateReferralForm } from '../../../../providers/CreateReferralFormProvider'
import { useReferralPayoutAsset } from '../../../../providers/ReferralPayoutAssetProvider'
import { useTnsFeesQuery } from '../../../../queries/useTnsFeesQuery'

const debounceDelayMs = 300

export const Fees = () => {
  const { t } = useTranslation()
  const { control, setValue } = useCreateReferralForm()
  const referralFeeAmount = useWatch({ control, name: 'referralFeeAmount' })
  const expiration = useWatch({ control, name: 'expiration' })
  const safeExpiration = expiration ?? 1
  const debouncedExpiration = useDebounce(safeExpiration, debounceDelayMs)
  const tnsFees = useTnsFeesQuery(debouncedExpiration)
  const formatFiatAmount = useFormatFiatAmount()
  const [coin] = useReferralPayoutAsset()
  const coinPrice = useCoinPriceQuery({
    coin,
  })

  const query = useMergeQueries({
    coinPrice,
    tnsFees,
  })

  useEffect(() => {
    const totalFee = tnsFees.data?.runeFee
    if (totalFee === undefined) return
    if (referralFeeAmount === totalFee) return

    setValue('referralFeeAmount', totalFee, {
      shouldValidate: true,
    })
  }, [referralFeeAmount, setValue, tnsFees.data?.runeFee])

  const costs = useMemo(() => {
    const totalFee = tnsFees.data?.runeFee ?? 0
    const registerFee = tnsFees.data?.registerFee ?? 0

    return {
      registerFee,
      totalFee,
    }
  }, [tnsFees.data?.registerFee, tnsFees.data?.runeFee])

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
        success={({ coinPrice }) => {
          const registerFeeFiat = formatFiatAmount(
            costs.registerFee * coinPrice
          )

          const totalFeeFiat = formatFiatAmount(costs.totalFee * coinPrice)

          return (
            <>
              {/* Registration fee row */}
              <RowWrapper>
                <Text size={13} color="supporting">
                  {t('referral_reg_fee')}
                </Text>
                <VStack alignItems="flex-end">
                  <Text size={14}>
                    {formatAmount(costs.registerFee, { ticker: 'RUNE' })}
                  </Text>
                  <Text size={14} color="supporting">
                    {registerFeeFiat}
                  </Text>
                </VStack>
              </RowWrapper>

              {/* Costs row – total to send */}
              <RowWrapper>
                <Text size={13} color="supporting">
                  {t('referral_costs')}
                </Text>
                <VStack alignItems="flex-end">
                  <Text size={14}>
                    {formatAmount(costs.totalFee, { ticker: 'RUNE' })}
                  </Text>
                  <Text size={14} color="supporting">
                    {totalFeeFiat}
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
