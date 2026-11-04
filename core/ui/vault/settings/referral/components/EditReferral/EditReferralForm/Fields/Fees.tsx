import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { SettingsBaselineText } from '@core/ui/settings/SettingsBaselineText'
import { useDebounce } from '@lib/ui/hooks/useDebounce'
import { CenterAbsolutely } from '@lib/ui/layout/CenterAbsolutely'
import { hStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useMergeQueries } from '@lib/ui/query/hooks/useMergeQueries'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { extractErrorMsg } from '@vultisig/lib-utils/error/extractErrorMsg'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { useEffect, useMemo } from 'react'
import { useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useFormatFiatAmount } from '../../../../../../../chain/hooks/useFormatFiatAmount'
import { useEditReferralFormData } from '../../../../providers/EditReferralFormProvider'
import { useTnsFeesQuery } from '../../../../queries/useTnsFeesQuery'
import { useUserValidThorchainNameQuery } from '../../../../queries/useUserValidThorchainNameQuery'

/** Edit Referral's current expiry, annual fee and extension fee, in RUNE and fiat. */
export const Fees = () => {
  const { t } = useTranslation()
  const { control, setValue, trigger } = useEditReferralFormData()
  const existing = useUserValidThorchainNameQuery()
  const runeCoin = chainFeeCoin.THORChain
  const runePrice = useCoinPriceQuery({ coin: runeCoin })
  const formatFiatAmount = useFormatFiatAmount()

  const expiration = useWatch({ control, name: 'expiration' })
  const referralFeeAmount = useWatch({ control, name: 'referralFeeAmount' })
  const requestedYears = useDebounce(expiration, 300)

  const tnsFees1y = useTnsFeesQuery(1)

  const query = useMergeQueries({ runePrice, existing, tnsFees: tnsFees1y })

  const extensionFee = useMemo(() => {
    const remaining = existing.data?.remainingYears ?? 0
    const yearsToAdd = Math.max(0, Math.ceil(requestedYears - remaining))
    const perYearFee = tnsFees1y.data?.perYearFee ?? 0
    return perYearFee * yearsToAdd
  }, [
    existing.data?.remainingYears,
    requestedYears,
    tnsFees1y.data?.perYearFee,
  ])

  useEffect(() => {
    if (referralFeeAmount === extensionFee) return
    setValue('referralFeeAmount', extensionFee)
    trigger()
  }, [extensionFee, referralFeeAmount, setValue, trigger])

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
        success={({ runePrice, existing: valid, tnsFees }) => {
          const remaining = valid?.remainingYears ?? 0
          const yearsToAdd = Math.max(0, Math.ceil(requestedYears - remaining))
          const perYearFee = tnsFees.perYearFee

          const perYearFiat = formatFiatAmount(perYearFee * runePrice)
          const totalFiat = formatFiatAmount(extensionFee * runePrice)

          return (
            <>
              <RowWrapper>
                <SettingsBaselineText color="shy" variant="footnote">
                  {t('current_expiry')}
                </SettingsBaselineText>
                <SettingsBaselineText variant="stationBodyS">
                  {Math.ceil(remaining)} yrs
                </SettingsBaselineText>
              </RowWrapper>

              <RowWrapper>
                <SettingsBaselineText color="shy" variant="footnote">
                  {t('referral_annual_fee')}
                </SettingsBaselineText>
                <VStack alignItems="flex-end">
                  <SettingsBaselineText variant="stationBodyS">
                    {formatAmount(perYearFee, { ticker: 'RUNE' })} / yr
                  </SettingsBaselineText>
                  <SettingsBaselineText color="shy" variant="stationBodyS">
                    {perYearFiat}
                  </SettingsBaselineText>
                </VStack>
              </RowWrapper>

              <RowWrapper>
                <SettingsBaselineText color="shy" variant="footnote">
                  {t('referral_extension_fee', { years: yearsToAdd })}
                </SettingsBaselineText>
                <VStack alignItems="flex-end">
                  <SettingsBaselineText variant="stationBodyS">
                    {formatAmount(extensionFee, { ticker: 'RUNE' })}
                  </SettingsBaselineText>
                  <SettingsBaselineText color="shy" variant="stationBodyS">
                    {totalFiat}
                  </SettingsBaselineText>
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
