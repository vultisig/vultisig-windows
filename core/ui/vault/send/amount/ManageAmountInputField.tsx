import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { getFeeAmount } from '@core/chain/tx/fee/getFeeAmount'
import { ActionInsideInteractiveElement } from '@lib/ui/base/ActionInsideInteractiveElement'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { AmountTextInput } from '@lib/ui/inputs/AmountTextInput'
import { InputLabel } from '@lib/ui/inputs/InputLabel'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { StrictInfoRow } from '@lib/ui/layout/StrictInfoRow'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { isEqual } from '@lib/utils/number/isEqual'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { useCurrentVaultCoin } from '../../state/currentVaultCoins'
import { SendCoinBalanceDependant } from '../coin/balance/SendCoinBalanceDependant'
import { HorizontalLine } from '../components/HorizontalLine'
import { SendInputContainer } from '../components/SendInputContainer'
import { SendFiatFee } from '../fee/SendFiatFeeWrapper'
import { SendGasFeeWrapper } from '../fee/SendGasFeeWrapper'
import { ManageFeeSettings } from '../fee/settings/ManageFeeSettings'
import { ManageMemo } from '../memo/ManageMemo'
import { useSendChainSpecificQuery } from '../queries/useSendChainSpecificQuery'
import { useSendAmount } from '../state/amount'
import { useSendFormFieldState } from '../state/formFields'
import { AmountInGlobalCurrencyDisplay } from './AmountInGlobalCurrencyDisplay'
import { AmountSuggestion } from './AmountSuggestion'

const suggestions = {
  quarter: 0.25,
  half: 0.5,
  threeQuarters: 0.75,
  max: 1,
} as const

export const ManageAmountInputField = () => {
  const { t } = useTranslation()
  const [value, setValue] = useSendAmount()
  const [{ coin: coinKey }] = useCoreViewState<'send'>()
  const coin = useCurrentVaultCoin(coinKey)
  const { decimals, ticker } = coin
  const chainSpecificQuery = useSendChainSpecificQuery()

  const [
    {
      errors: { amount: amountError },
    },
    setFocusedSendField,
  ] = useSendFormFieldState()

  const error = !!amountError && value ? amountError : undefined

  const handleUpdateAmount = useCallback(
    (value: number | null) => {
      setValue(value)
      setFocusedSendField(state => ({
        ...state,
        fieldsChecked: {
          ...state.fieldsChecked,
          amount: value ? true : false,
        },
      }))
    },
    [setFocusedSendField, setValue]
  )

  return (
    <SendInputContainer>
      <HStack justifyContent="space-between" alignItems="center">
        <InputLabel>{t('amount')}</InputLabel>
        <ManageFeeSettings />
      </HStack>
      <HorizontalLine />
      <VStack gap={8}>
        <ActionInsideInteractiveElement
          render={() => (
            <AmountTextInput
              validation={error ? 'warning' : undefined}
              suggestion={
                <SendCoinBalanceDependant
                  pending={() => null}
                  error={() => null}
                  success={amount => (
                    <HStack alignItems="center" gap={4}>
                      {Object.values(suggestions).map(suggestion => {
                        const suggestionValue =
                          suggestion === suggestions.max
                            ? fromChainAmount(
                                amount -
                                  (chainSpecificQuery.data
                                    ? getFeeAmount(chainSpecificQuery.data)
                                    : BigInt(0)),
                                decimals
                              )
                            : fromChainAmount(amount, decimals) * suggestion

                        return (
                          <AmountSuggestion
                            isActive={
                              value ? isEqual(value, suggestionValue) : false
                            }
                            onClick={() => handleUpdateAmount(suggestionValue)}
                            key={suggestion}
                            value={suggestion}
                          />
                        )
                      })}
                    </HStack>
                  )}
                />
              }
              placeholder={t('enter_amount')}
              value={value}
              onValueChange={value => handleUpdateAmount(value)}
            />
          )}
          action={<AmountInGlobalCurrencyDisplay />}
          actionPlacerStyles={{
            right: 12,
            bottom: 20,
          }}
        />
        {error && (
          <Text size={12} color="warning">
            {error}
          </Text>
        )}
        <SendCoinBalanceDependant
          pending={() => null}
          error={() => null}
          success={amount => (
            <TotalBalanceWrapper
              justifyContent="space-between"
              alignItems="center"
            >
              <Text as="span" size={14} color="contrast">
                {t('balance_available')}:
              </Text>{' '}
              <Text size={14}>
                {`${fromChainAmount(amount, decimals)} ${ticker} `}
              </Text>
            </TotalBalanceWrapper>
          )}
        />
      </VStack>
      <ManageMemo />
      <HorizontalLine />
      <StrictInfoRow>
        <SendFiatFee />
      </StrictInfoRow>
      <StrictInfoRow>
        <SendGasFeeWrapper />
      </StrictInfoRow>
    </SendInputContainer>
  )
}

const TotalBalanceWrapper = styled(HStack)`
  background-color: ${getColor('foreground')};
  padding: 16px;
  ${borderRadius.m}
`
