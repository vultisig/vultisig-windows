import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { ActionInsideInteractiveElement } from '@lib/ui/base/ActionInsideInteractiveElement'
import { MaxButton, maxButtonOffset } from '@lib/ui/buttons/MaxButton'
import { AmountTextInput } from '@lib/ui/inputs/AmountTextInput'
import { InputContainer } from '@lib/ui/inputs/InputContainer'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { AmountSuggestion } from '../../../../../../send/amount/AmountSuggestion'
import {
  useCurrentVaultAddress,
  useCurrentVaultCoin,
} from '../../../../../../state/currentVaultCoins'
import { useDepositFormHandlers } from '../../../../../providers/DepositFormHandlersProvider'
import {
  clampPercentage,
  toNumericValue,
} from '../../../../../utils/percentage'
import { useUnstakableTcyQuery } from '../hooks/useUnstakableTcyQuery'

export const UnstakeTCYNative = () => {
  const [{ control, setValue }] = useDepositFormHandlers()
  const { t } = useTranslation()
  const address = useCurrentVaultAddress(Chain.THORChain)
  const { data: tcyBalance = 0n } = useUnstakableTcyQuery({
    address,
    options: { enabled: !!address },
  })

  const { decimals, ticker } = useCurrentVaultCoin({
    id: 'tcy',
    chain: Chain.THORChain,
  })
  const maxDisplay = fromChainAmount(tcyBalance, decimals)

  return (
    <InputContainer>
      <Text size={15}>
        {t('percentage_to_unstake')} ({t('staked_amount')}: {maxDisplay}{' '}
        {ticker})
      </Text>
      <ActionInsideInteractiveElement
        render={() => (
          <Controller
            control={control}
            name="percentage"
            render={({ field }) => {
              const handlePercentageChange = (value: number | null) => {
                if (value === null) {
                  field.onChange('')
                  return
                }

                const clamped = clampPercentage(value)
                field.onChange(clamped)
              }

              return (
                <AmountTextInput
                  placeholder={t('enter_percentage')}
                  value={toNumericValue(field.value)}
                  onValueChange={handlePercentageChange}
                  shouldBePositive
                  suggestion={
                    <HStack gap={4}>
                      {[0.25, 0.5, 0.75].map(v => (
                        <AmountSuggestion
                          key={v}
                          value={v}
                          onClick={() => handlePercentageChange(v * 100)}
                        />
                      ))}
                    </HStack>
                  }
                />
              )
            }}
          />
        )}
        action={
          <MaxButton
            onClick={() =>
              setValue('percentage', 100, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          >
            {t('max')}
          </MaxButton>
        }
        actionPlacerStyles={{ right: maxButtonOffset, bottom: maxButtonOffset }}
      />
    </InputContainer>
  )
}
