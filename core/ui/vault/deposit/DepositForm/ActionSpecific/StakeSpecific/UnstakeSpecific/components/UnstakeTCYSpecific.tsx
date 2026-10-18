import { Checkbox } from '@lib/ui/inputs/checkbox/Checkbox'
import { VStack } from '@lib/ui/layout/Stack'
import { Controller, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useDepositFormHandlers } from '../../../../../providers/DepositFormHandlersProvider'
import { UnstakeSTCY } from './UnstakeSTCY'
import { UnstakeTCYNative } from './UnstakeTCYNative'

/**
 * TCY unstake controls, switching between native TCY and auto-compounded
 * sTCY on the `autoCompound` checkbox. Reads the form through `useWatch`
 * because nothing above it re-renders after the checkbox changes.
 */
export const UnstakeTCYSpecific = () => {
  const [{ control, setValue }] = useDepositFormHandlers()
  const autoCompound = useWatch({ control, name: 'autoCompound' })
  const { t } = useTranslation()

  return (
    <VStack gap={12}>
      {autoCompound ? <UnstakeSTCY /> : <UnstakeTCYNative />}
      <Controller
        name="autoCompound"
        control={control}
        render={({ field }) => (
          <Checkbox
            value={field.value}
            onChange={v => {
              field.onChange(v)
              setValue('percentage', undefined, { shouldValidate: true })
              setValue('amount', undefined, { shouldValidate: true })
            }}
            label={t('unstake_share_token_label', { ticker: 'sTCY' })}
          />
        )}
      />
    </VStack>
  )
}
