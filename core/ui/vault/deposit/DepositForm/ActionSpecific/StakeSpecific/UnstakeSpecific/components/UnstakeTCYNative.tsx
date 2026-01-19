import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { ActionInsideInteractiveElement } from '@lib/ui/base/ActionInsideInteractiveElement'
import { MaxButton, maxButtonOffset } from '@lib/ui/buttons/MaxButton'
import { AmountTextInput } from '@lib/ui/inputs/AmountTextInput'
import { InputContainer } from '@lib/ui/inputs/InputContainer'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { AmountSuggestion } from '../../../../../../send/amount/AmountSuggestion'
import {
  useCurrentVaultAddress,
  useCurrentVaultCoin,
} from '../../../../../../state/currentVaultCoins'
import { useDepositFormHandlers } from '../../../../../providers/DepositFormHandlersProvider'
import { useUnstakableTcyQuery } from '../hooks/useUnstakableTcyQuery'

export const UnstakeTCYNative = () => {
  const [{ setValue, watch }] = useDepositFormHandlers()
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

  // Use watch for reactive updates
  const percentageValue = watch('percentage')

  const numericValue =
    typeof percentageValue === 'number'
      ? percentageValue
      : typeof percentageValue === 'string' && percentageValue !== ''
        ? Number(percentageValue)
        : null

  return (
    <InputContainer>
      <Text size={15}>
        {t('percentage_to_unstake')} ({t('staked_amount')}: {maxDisplay}{' '}
        {ticker})
      </Text>
      <ActionInsideInteractiveElement
        render={() => (
          <AmountTextInput
            placeholder={t('enter_percentage')}
            value={numericValue}
            onValueChange={value => {
              setValue('percentage', value ?? undefined, {
                shouldValidate: true,
              })
            }}
            shouldBePositive
            suggestion={
              <HStack gap={4}>
                {[0.25, 0.5, 0.75].map(v => (
                  <AmountSuggestion
                    key={v}
                    value={v}
                    onClick={() =>
                      setValue('percentage', v * 100, {
                        shouldValidate: true,
                      })
                    }
                  />
                ))}
              </HStack>
            }
          />
        )}
        action={
          <MaxButton
            onClick={() =>
              setValue('percentage', 100, { shouldValidate: true })
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
