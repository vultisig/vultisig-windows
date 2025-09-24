import { Chain } from '@core/chain/Chain'
import { tcyAutoCompounderConfig } from '@core/chain/chains/cosmos/thor/tcy-autocompound/config'
import { knownCosmosTokens } from '@core/chain/coin/knownTokens/cosmos'
import { ActionInsideInteractiveElement } from '@lib/ui/base/ActionInsideInteractiveElement'
import { MaxButton, maxButtonOffset } from '@lib/ui/buttons/MaxButton'
import { AmountTextInput } from '@lib/ui/inputs/AmountTextInput'
import { InputContainer } from '@lib/ui/inputs/InputContainer'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { AmountSuggestion } from '../../../../../../send/amount/AmountSuggestion'
import { useCurrentVaultAddress } from '../../../../../../state/currentVaultCoins'
import { useDepositFormHandlers } from '../../../../../providers/DepositFormHandlersProvider'
import { useUnstakableStcyQuery } from '../hooks/useUnstakableSTcyQuery'

export const UnstakeSTCY = () => {
  const [{ setValue, getValues }] = useDepositFormHandlers()
  const { t } = useTranslation()
  const address = useCurrentVaultAddress(Chain.THORChain)

  const { data: { humanReadableBalance = 0 } = {} } = useUnstakableStcyQuery({
    address,
    options: { enabled: !!address },
  })

  const error =
    getValues('amount') > humanReadableBalance ? 'Invalid amount' : null

  return (
    <InputContainer>
      <Text size={15}>
        {t('amount_to_unstake')} ({t('staked_amount')}: {humanReadableBalance}{' '}
        {tcyAutoCompounderConfig.shareTicker})
      </Text>
      <ActionInsideInteractiveElement
        render={() => (
          <AmountTextInput
            suggestion={
              <HStack gap={4}>
                {[0.25, 0.5, 0.75].map(v => (
                  <AmountSuggestion
                    key={v}
                    value={v}
                    onClick={() => {
                      setValue('percentage', v * 100, {
                        shouldValidate: true,
                      })

                      const amount = Number(
                        (v * humanReadableBalance).toFixed(
                          knownCosmosTokens.THORChain['x/staking-tcy'].decimals
                        )
                      )

                      setValue('amount', amount, {
                        shouldValidate: true,
                      })
                    }}
                  />
                ))}
              </HStack>
            }
            type="number"
            placeholder={t('enter_percentage')}
            shouldBePositive
            value={getValues('percentage')}
            onValueChange={value => {
              const percentage = value ?? 0
              setValue('percentage', percentage, { shouldValidate: true })
              const amount = Number(
                ((percentage / 100) * humanReadableBalance).toFixed(
                  knownCosmosTokens.THORChain['x/staking-tcy'].decimals
                )
              )
              setValue('amount', amount, { shouldValidate: true })
            }}
          />
        )}
        action={
          <MaxButton
            onClick={() => {
              setValue('percentage', 100, {
                shouldValidate: true,
              })

              setValue('amount', humanReadableBalance, {
                shouldValidate: true,
              })
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
