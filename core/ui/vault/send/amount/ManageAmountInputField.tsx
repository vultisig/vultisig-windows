import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { ActionInsideInteractiveElement } from '@lib/ui/base/ActionInsideInteractiveElement'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { AmountTextInput } from '@lib/ui/inputs/AmountTextInput'
import { InputLabel } from '@lib/ui/inputs/InputLabel'
import { HStack } from '@lib/ui/layout/Stack'
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
import { useFocusedSendField } from '../providers/FocusedSendFieldProvider'
import { useSendAmount } from '../state/amount'
import { AmountInGlobalCurrencyDisplay } from './AmountInGlobalCurrencyDisplay'
import { AmountSuggestion } from './AmountSuggestion'

const suggestions = [0.25, 0.5, 1]

export const ManageAmountInputField = () => {
  const { t } = useTranslation()
  const [value, setValue] = useSendAmount()
  const [{ coin: coinKey }] = useCoreViewState<'send'>()
  const coin = useCurrentVaultCoin(coinKey)
  const { decimals, ticker } = coin
  const [, setFocusedSendField] = useFocusedSendField()

  const handleUpdateAmount = useCallback(
    (value: number) => {
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
      <InputLabel>{t('amount')}</InputLabel>
      <HorizontalLine />

      <ActionInsideInteractiveElement
        render={() => (
          <AmountTextInput
            suggestion={
              <SendCoinBalanceDependant
                pending={() => null}
                error={() => null}
                success={amount => (
                  <HStack alignItems="center" gap={4}>
                    {suggestions.map(suggestion => {
                      const suggestionValue =
                        fromChainAmount(amount, decimals) * suggestion

                      return (
                        <AmountSuggestion
                          isActive={
                            value ? isEqual(value, suggestionValue) : false
                          }
                          onClick={() => {
                            handleUpdateAmount(suggestionValue)
                          }}
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
            onValueChange={setValue}
          />
        )}
        action={<AmountInGlobalCurrencyDisplay />}
        actionPlacerStyles={{
          right: 12,
          bottom: 20,
        }}
      />
      <SendCoinBalanceDependant
        pending={() => null}
        error={() => null}
        success={amount => (
          <TotalBalanceWrapper
            justifyContent="space-between"
            alignItems="center"
          >
            <Text as="span" size={14} color="contrast">
              Balance available:
            </Text>{' '}
            <Text color="shy" size={14}>
              {`${fromChainAmount(amount, decimals)} ${ticker} `}
            </Text>
          </TotalBalanceWrapper>
        )}
      />
    </SendInputContainer>
  )
}

const TotalBalanceWrapper = styled(HStack)`
  background-color: ${getColor('foreground')};
  padding: 16px;
  ${borderRadius.m}
`
