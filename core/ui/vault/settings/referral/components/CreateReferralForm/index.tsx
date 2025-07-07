import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { FormProvider, useForm } from 'react-hook-form'

import { DecorationLine } from '../Referrals.styled'
import { ReferralFormData, referralSchema } from './config'
import { ExpirationField } from './Fields/ExpirationField'
import { Fees } from './Fields/Fees'
import { PayoutAssetField } from './Fields/PayoutAssetField'
import { ReferralCodeField } from './Fields/ReferralCodeField'

export const CreateReferralForm = () => {
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
        <VStack gap={14}>
          <ReferralCodeField />
          <DecorationLine />
          <ExpirationField />
          <DecorationLine />
          <PayoutAssetField />
          <DecorationLine />
          <Fees />
        </VStack>
        <Button type="submit">Create Referral</Button>
      </VStack>
    </FormProvider>
  )
}
