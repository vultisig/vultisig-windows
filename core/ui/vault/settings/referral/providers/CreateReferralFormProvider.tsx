import { zodResolver } from '@hookform/resolvers/zod'
import { ChildrenProp } from '@lib/ui/props'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'

import {
  CreateReferralFormData,
  referralSchema,
} from '../components/CreateReferral/CreateReferralForm/config'

export const CreateReferralFormProvider = ({ children }: ChildrenProp) => {
  const methods = useForm<CreateReferralFormData>({
    resolver: zodResolver(referralSchema),
    defaultValues: { referralName: '', expiration: 1, referralFeeAmount: 0 },
    mode: 'onBlur',
  })

  return <FormProvider {...methods}>{children}</FormProvider>
}

export const useCreateReferralForm = () =>
  useFormContext<CreateReferralFormData>()
