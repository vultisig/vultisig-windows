import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { tcyAutoCompounderConfig } from '@core/chain/chains/cosmos/thor/tcy-autocompound/config'
import { AmountSuggestion } from '@core/ui/vault/send/amount/AmountSuggestion'
import {
  useCurrentVaultAddress,
  useCurrentVaultCoins,
} from '@core/ui/vault/state/currentVaultCoins'
import { ActionInsideInteractiveElement } from '@lib/ui/base/ActionInsideInteractiveElement'
import { MaxButton, maxButtonOffset } from '@lib/ui/buttons/MaxButton'
import { AmountTextInput } from '@lib/ui/inputs/AmountTextInput'
import { Checkbox } from '@lib/ui/inputs/checkbox/Checkbox'
import { InputContainer } from '@lib/ui/inputs/InputContainer'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useDepositFormHandlers } from '../../../../providers/DepositFormHandlersProvider'
import { useUnstakableStakeAssetQuery } from './hooks/useUnstakableStakeAssetQuery'

const suggestions = [0.25, 0.5, 0.75]

export const UnstakeTCYSpecific = () => {
  const [{ setValue, getValues, control, watch }] = useDepositFormHandlers()
  const autoCompound = watch('autoCompound')
  const { t } = useTranslation()
  const address = useCurrentVaultAddress(Chain.THORChain)

  const { data: { tcyBalance = 0n, stcyBalance = 0n } = {} } =
    useUnstakableStakeAssetQuery({
      address,
      autoCompound,
    })

  const coins = useCurrentVaultCoins()
  const percentage = getValues('percentage')

  const tcyCoin = coins.find(c => c.id === 'tcy')
  const decimals = tcyCoin?.decimals ?? 8
  const ticker = tcyCoin?.ticker ?? 'TCY'
  const maxDisplayAmount = fromChainAmount(
    autoCompound ? stcyBalance : tcyBalance,
    decimals
  )

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

      <Controller
        name="autoCompound"
        control={control}
        render={({ field }) => (
          <Checkbox
            value={field.value}
            onChange={field.onChange}
            label={t('unstake_share_token_label', {
              ticker: tcyAutoCompounderConfig.shareTicker,
            })}
          />
        )}
      />
    </VStack>
  )
}
