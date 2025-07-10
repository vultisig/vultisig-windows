import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { useDebounce } from '@lib/ui/hooks/useDebounce'
import { CenterAbsolutely } from '@lib/ui/layout/CenterAbsolutely'
import { hStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useMergeQueries } from '@lib/ui/query/hooks/useMergeQueries'
import { Text } from '@lib/ui/text'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { formatAmount } from '@lib/utils/formatAmount'
import { formatTokenAmount } from '@lib/utils/formatTokenAmount'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCoinPriceQuery } from '../../../../../../chain/coin/price/queries/useCoinPriceQuery'
import { useFiatCurrency } from '../../../../../../storage/fiatCurrency'
import { useCurrentVaultCoins } from '../../../../../state/currentVaultCoins'
import { useTnsFeesQuery } from '../../../queries/useTnsFeesQuery'
import { ReferralFormData } from '../config'

const debounceDelayMs = 300

export const Fees = () => {
  const { t } = useTranslation()
  const { watch } = useFormContext<ReferralFormData>()

  const expiration = watch('expiration')
  const debouncedExpiration = useDebounce(expiration, debounceDelayMs)
  const tnsFees = useTnsFeesQuery(debouncedExpiration)
  const currency = useFiatCurrency()

  const coin = shouldBePresent(
    useCurrentVaultCoins().find(
      coin => coin.ticker === chainFeeCoin.THORChain.ticker
    )
  )

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
          const registerFeeFiat = formatAmount(
            registerFee * coinPrice,
            currency
          )
          const renewalFeeFiat = formatAmount(
            (runeFee - registerFee) * coinPrice,
            currency
          )

          return (
            <>
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
              <RowWrapper>
                <Text size={13} color="supporting">
                  {t('referral_costs')}
                </Text>
                <VStack alignItems="flex-end">
                  <Text size={14}>
                    {debouncedExpiration} x{' '}
                    {formatTokenAmount(registerFee, 'RUNE')}
                  </Text>
                  <Text size={14} color="supporting">
                    {renewalFeeFiat}
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
