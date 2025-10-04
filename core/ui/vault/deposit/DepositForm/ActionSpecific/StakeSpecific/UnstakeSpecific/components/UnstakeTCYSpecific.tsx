import { Checkbox } from '@lib/ui/inputs/checkbox/Checkbox'
import { VStack } from '@lib/ui/layout/Stack'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useDepositFormHandlers } from '../../../../../providers/DepositFormHandlersProvider'
import { UnstakeSTCY } from './UnstakeSTCY'
import { UnstakeTCYNative } from './UnstakeTCYNative'

export const UnstakeTCYSpecific = () => {
  const [{ control, setValue, watch }] = useDepositFormHandlers()
  const autoCompound = watch('autoCompound')
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
