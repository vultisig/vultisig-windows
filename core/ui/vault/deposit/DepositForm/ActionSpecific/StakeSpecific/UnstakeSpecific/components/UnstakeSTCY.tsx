import { Chain } from '@core/chain/Chain'
import { tcyAutoCompounderConfig } from '@core/chain/chains/cosmos/thor/tcy-autocompound/config'
import { knownCosmosTokens } from '@core/chain/coin/knownTokens/cosmos'
import { ActionInsideInteractiveElement } from '@lib/ui/base/ActionInsideInteractiveElement'
import { MaxButton, maxButtonOffset } from '@lib/ui/buttons/MaxButton'
import { AmountTextInput } from '@lib/ui/inputs/AmountTextInput'
import { InputContainer } from '@lib/ui/inputs/InputContainer'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useCallback, useEffect } from 'react'
import { Controller, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { AmountSuggestion } from '../../../../../../send/amount/AmountSuggestion'
import { useCurrentVaultAddress } from '../../../../../../state/currentVaultCoins'
import { useDepositFormHandlers } from '../../../../../providers/DepositFormHandlersProvider'
import {
  clampPercentage,
  toNumericValue,
} from '../../../../../utils/percentage'
import { useUnstakableStcyQuery } from '../hooks/useUnstakableSTcyQuery'

export const UnstakeSTCY = () => {
  const [{ control, setValue }] = useDepositFormHandlers()
  const { t } = useTranslation()
  const address = useCurrentVaultAddress(Chain.THORChain)

  const { data: { humanReadableBalance = 0 } = {} } = useUnstakableStcyQuery({
    address,
    options: { enabled: !!address },
  })

  const percentageValue = useWatch({ control, name: 'percentage' })
  const amountValue = useWatch({ control, name: 'amount' })
  const numericPercentage = toNumericValue(percentageValue)
  const numericAmount = toNumericValue(amountValue)
  const decimals = knownCosmosTokens.THORChain['x/staking-tcy'].decimals

  const syncAmountFromPercentage = useCallback(
    (percentage: number | null, shouldValidate = true) => {
      if (percentage === null) {
        setValue('amount', undefined, {
          shouldDirty: true,
          shouldValidate,
        })
        return
      }

      const clamped = clampPercentage(percentage)
      const amount = Number(
        ((clamped / 100) * humanReadableBalance).toFixed(decimals)
      )

      setValue('amount', amount, {
        shouldDirty: true,
        shouldValidate,
      })
    },
    [decimals, humanReadableBalance, setValue]
  )

  useEffect(() => {
    if (numericPercentage === null) return

    const expectedAmount = Number(
      (
        (clampPercentage(numericPercentage) / 100) *
        humanReadableBalance
      ).toFixed(decimals)
    )

    if (numericAmount !== expectedAmount) {
      syncAmountFromPercentage(numericPercentage)
    }
  }, [
    decimals,
    humanReadableBalance,
    numericAmount,
    numericPercentage,
    syncAmountFromPercentage,
  ])

  const error =
    numericAmount !== null && numericAmount > humanReadableBalance
      ? 'Invalid amount'
      : null

  return (
    <InputContainer>
      <Text size={15}>
        {t('amount_to_unstake')} ({t('staked_amount')}: {humanReadableBalance}{' '}
        {tcyAutoCompounderConfig.shareTicker})
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
                  syncAmountFromPercentage(null)
                  return
                }

                const clamped = clampPercentage(value)
                field.onChange(clamped)
                syncAmountFromPercentage(clamped)
              }

              return (
                <AmountTextInput
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
                  type="number"
                  placeholder={t('enter_percentage')}
                  shouldBePositive
                  value={numericPercentage}
                  onValueChange={handlePercentageChange}
                />
              )
            }}
          />
        )}
        action={
          <MaxButton
            onClick={() => {
              setValue('percentage', 100, {
                shouldDirty: true,
                shouldValidate: true,
              })

              syncAmountFromPercentage(100)
            }}
          >
            {t('max')}
          </MaxButton>
        }
        actionPlacerStyles={{ right: maxButtonOffset, bottom: maxButtonOffset }}
      />
      {error && (
        <Text size={12} color="danger">
          {error}
        </Text>
      )}
    </InputContainer>
  )
}
