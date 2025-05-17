import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { ActionInsideInteractiveElement } from '@lib/ui/base/ActionInsideInteractiveElement'
import { MaxButton, maxButtonOffset } from '@lib/ui/buttons/MaxButton'
import { AmountTextInput } from '@lib/ui/inputs/AmountTextInput'
import { HStack } from '@lib/ui/layout/Stack'
import { useTranslation } from 'react-i18next'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { SendCoinBalanceDependant } from '../coin/balance/SendCoinBalanceDependant'
import { useSendAmount } from '../state/amount'
import { AmountSuggestion } from './AmountSuggestion'

const suggestions = [0.25, 0.5]

export const ManageAmount = () => {
  const [value, setValue] = useSendAmount()
  const { t } = useTranslation()

  const [{ coin: coinKey }] = useCoreViewState<'send'>()
  const { decimals } = useCurrentVaultCoin(coinKey)

  return (
    <ActionInsideInteractiveElement
      render={() => (
        <AmountTextInput
          label={t('amount')}
          suggestion={
            <SendCoinBalanceDependant
              pending={() => null}
              error={() => null}
              success={amount => (
                <HStack alignItems="center" gap={4}>
                  {suggestions.map(suggestion => (
                    <AmountSuggestion
                      onClick={() => {
                        setValue(fromChainAmount(amount, decimals) * suggestion)
                      }}
                      key={suggestion}
                      value={suggestion}
                    />
                  ))}
                </HStack>
              )}
            />
          }
          placeholder={t('enter_amount')}
          value={value}
          onValueChange={setValue}
        />
      )}
      action={
        <SendCoinBalanceDependant
          pending={() => null}
          error={() => null}
          success={amount => (
            <MaxButton
              onClick={() => {
                setValue(fromChainAmount(amount, decimals))
              }}
            >
              {t('max')}
            </MaxButton>
          )}
        />
      }
      actionPlacerStyles={{
        right: maxButtonOffset,
        bottom: maxButtonOffset,
      }}
    />
  )
}
