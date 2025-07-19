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

import { useCoinPriceQuery } from '../../../../../../../chain/coin/price/queries/useCoinPriceQuery'
import { useFiatCurrency } from '../../../../../../../storage/fiatCurrency'
import { useReferralSender } from '../../../../hooks/useReferralSender'
import { useEditReferralFormData } from '../../../../providers/EditReferralFormProvider'
import { useReferralPayoutAsset } from '../../../../providers/ReferralPayoutAssetProvider'
import { useTnsFeesQuery } from '../../../../queries/useTnsFeesQuery'
import { useUserValidThorchainNameQuery } from '../../../../queries/useUserValidThorchainNameQuery'

const debounceDelayMs = 300

export const Fees = () => {
  const { t } = useTranslation()
  const { watch, setValue } = useEditReferralFormData()
  const address = useReferralSender()
  const existing = useUserValidThorchainNameQuery(address)
  const yearsToAdd = watch('expiration')
  const debouncedYears = useDebounce(yearsToAdd, debounceDelayMs)

  const tnsFees = useTnsFeesQuery(debouncedYears)
  const currency = useFiatCurrency()
  const [coin] = useReferralPayoutAsset()
  const coinPrice = useCoinPriceQuery({ coin })

  const query = useMergeQueries({ coinPrice, tnsFees, existing })

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
          coinPrice,
          tnsFees: { registerFee, runeFee },
          existing: valid,
        }) => {
          // only block-fees = runeFee - registerFee
          const extensionCost = runeFee - registerFee
          const currentValue = watch('referralFeeAmount')

          const perYearFee = extensionCost / debouncedYears

          if (currentValue !== extensionCost) {
            setValue('referralFeeAmount', extensionCost, {
              shouldValidate: true,
            })
          }

          // format fiat
          const perYearFiat = formatAmount(perYearFee * coinPrice, currency)
          const totalFiat = formatAmount(extensionCost * coinPrice, currency)

          return (
            <>
              <RowWrapper>
                <Text size={13} color="supporting">
                  {t('current_expiry')}
                </Text>
                <Text size={14}>{Math.ceil(valid?.remainingYears)} yrs</Text>
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
                  {t('referral_extension_fee', { years: debouncedYears })}
                </Text>
                <VStack alignItems="flex-end">
                  <Text size={14}>
                    {formatTokenAmount(extensionCost, 'RUNE')}
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
