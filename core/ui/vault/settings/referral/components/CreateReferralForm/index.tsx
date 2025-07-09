import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { StackSeparatedBy } from '@lib/ui/layout/StackSeparatedBy'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { DecorationLine } from '../Referrals.styled'
import { ReferralFormData, referralSchema } from './config'
import { ExpirationField } from './Fields/ExpirationField'
import { Fees } from './Fields/Fees'
import { PayoutAssetField } from './Fields/PayoutAssetField'
import { ReferralCodeField } from './Fields/ReferralCodeField'

export const CreateReferralForm = () => {
  const { t } = useTranslation()
  const methods = useForm<ReferralFormData>({
    resolver: zodResolver(referralSchema),
    defaultValues: { referralName: '', expiration: 1 },
    mode: 'onBlur',
  })

  const onSubmit = methods.handleSubmit(data => console.log(data))

  return (
    <FormProvider {...methods}>
      <VStack
        onSubmit={onSubmit}
        as="form"
        data-testid="CreateReferralForm-Wrapper"
        flexGrow
        justifyContent="space-between"
      >
        <StackSeparatedBy
          direction="column"
          separator={<DecorationLine />}
          gap={14}
        >
          <ReferralCodeField />
          <ExpirationField />
          <PayoutAssetField />
          <Fees />
        </StackSeparatedBy>
        <Button type="submit">{t('create_referral_form')}</Button>
      </VStack>
    </FormProvider>
  )
}
