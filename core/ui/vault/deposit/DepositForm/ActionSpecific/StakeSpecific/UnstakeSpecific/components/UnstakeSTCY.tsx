import { Chain } from '@core/chain/Chain'
import { tcyAutoCompounderConfig } from '@core/chain/chains/cosmos/thor/tcy-autocompound/config'
import { ActionInsideInteractiveElement } from '@lib/ui/base/ActionInsideInteractiveElement'
import { MaxButton, maxButtonOffset } from '@lib/ui/buttons/MaxButton'
import { AmountTextInput } from '@lib/ui/inputs/AmountTextInput'
import { InputContainer } from '@lib/ui/inputs/InputContainer'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { useCurrentVaultAddress } from '../../../../../../state/currentVaultCoins'
import { useDepositFormHandlers } from '../../../../../providers/DepositFormHandlersProvider'
import { useUnstakableStcyQuery } from '../hooks/useUnstakableSTcyQuery'

export const UnstakeSTCY = () => {
  const [{ setValue, getValues }] = useDepositFormHandlers()
  const { t } = useTranslation()
  const address = useCurrentVaultAddress(Chain.THORChain)

  const { data: { humanReadableBalance = 0, chainBalance = 0n } = {} } =
    useUnstakableStcyQuery({
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
          <VStack gap={4}>
            <AmountTextInput
              placeholder={t('enter_amount')}
              value={getValues('amount')}
              onChange={e =>
                setValue('amount', (e.target as HTMLInputElement).value, {
                  shouldValidate: true,
                })
              }
            />
            {error && (
              <Text size={12} color="danger">
                {error}
              </Text>
            )}
          </VStack>
        )}
        action={
          <MaxButton
            onClick={() =>
              setValue('amount', chainBalance.toString(), {
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
