import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { AmountSuggestion } from '@core/ui/vault/send/amount/AmountSuggestion'
import {
  useCurrentVaultAddress,
  useCurrentVaultCoins,
} from '@core/ui/vault/state/currentVaultCoins'
import { ActionInsideInteractiveElement } from '@lib/ui/base/ActionInsideInteractiveElement'
import { MaxButton, maxButtonOffset } from '@lib/ui/buttons/MaxButton'
import { AmountTextInput } from '@lib/ui/inputs/AmountTextInput'
import { InputContainer } from '@lib/ui/inputs/InputContainer'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { UseFormGetValues, UseFormSetValue } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { FormData } from '../../..'
import { useUnstakableTcyQuery } from './hooks/useUnstakableTcyQuery'

type Props = {
  setValue: UseFormSetValue<FormData>
  getValues: UseFormGetValues<FormData>
}

const suggestions = [0.25, 0.5, 0.75]

export const UnstakeTCYSpecific = ({ setValue, getValues }: Props) => {
  const { t } = useTranslation()
  const address = useCurrentVaultAddress(Chain.THORChain)
  const { data: unstakableTcy = 0n } = useUnstakableTcyQuery(address!)
  const coins = useCurrentVaultCoins()
  const percentage = getValues('percentage')

  const tcyCoin = coins.find(c => c.id === 'tcy')
  const decimals = tcyCoin?.decimals ?? 8
  const ticker = tcyCoin?.ticker ?? 'TCY'
  const maxDisplayAmount = fromChainAmount(unstakableTcy, decimals)

  return (
    <VStack gap={12}>
      <InputContainer>
        <Text size={15} weight="400">
          {t('percentage_to_unstake')} ({t('staked_amount')}: {maxDisplayAmount}{' '}
          {ticker}
          <Text as="span" color="danger" size={14}>
            *
          </Text>
          )
        </Text>

        <ActionInsideInteractiveElement
          render={() => (
            <AmountTextInput
              suggestion={
                <HStack alignItems="center" gap={4}>
                  {suggestions.map(suggestion => (
                    <AmountSuggestion
                      onClick={() => {
                        setValue('percentage', String(suggestion * 100), {
                          shouldValidate: true,
                        })
                      }}
                      key={suggestion}
                      value={suggestion}
                    />
                  ))}
                </HStack>
              }
              placeholder={t('enter_amount')}
              value={percentage}
              onChange={e => {
                const value = (e.target as HTMLInputElement).value
                setValue('percentage', value, {
                  shouldValidate: true,
                })
              }}
            />
          )}
          action={
            <MaxButton
              onClick={() => {
                setValue('percentage', '100', {
                  shouldValidate: true,
                })
              }}
            >
              {t('max')}
            </MaxButton>
          }
          actionPlacerStyles={{
            right: maxButtonOffset,
            bottom: maxButtonOffset,
          }}
        />
      </InputContainer>
    </VStack>
  )
}
