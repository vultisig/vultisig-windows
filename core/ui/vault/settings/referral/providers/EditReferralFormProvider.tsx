import { zodResolver } from '@hookform/resolvers/zod'
import { ChildrenProp } from '@lib/ui/props'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'

import {
  EditReferralFormData,
  editReferralSchema,
} from '../components/EditReferral/EditReferralForm/config'
import { useActivePoolsQuery } from '../queries/useActivePoolsQuery'

export const EditReferralFormProvider = ({ children }: ChildrenProp) => {
  const methods = useForm<EditReferralFormData>({
    resolver: zodResolver(editReferralSchema),
    defaultValues: {
      referralName: '',
      expiration: 1,
      referralFeeAmount: 0,
    },
    mode: 'onBlur',
  })

  useActivePoolsQuery()

  return <FormProvider {...methods}>{children}</FormProvider>
}

export const useEditReferralFormData = () =>
  useFormContext<EditReferralFormData>()
