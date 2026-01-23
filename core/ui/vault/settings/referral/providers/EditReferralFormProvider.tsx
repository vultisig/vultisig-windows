import { zodResolver } from '@hookform/resolvers/zod'
import { ChildrenProp } from '@lib/ui/props'
import { TFunction } from 'i18next'
import { useMemo } from 'react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

const createEditReferralSchema = (t: TFunction) =>
  z.object({
    expiration: z
      .number()
      .min(1, t('referral_expiration_minimum'))
      .max(1000, t('referral_expiration_maximum')),
    referralFeeAmount: z.number().min(0),
  })

type EditReferralFormData = z.infer<ReturnType<typeof createEditReferralSchema>>

export const EditReferralFormProvider = ({ children }: ChildrenProp) => {
  const { t } = useTranslation()
  const editReferralSchema = useMemo(() => createEditReferralSchema(t), [t])

  const methods = useForm<EditReferralFormData>({
    resolver: zodResolver(editReferralSchema),
    defaultValues: {
      expiration: 1,
      referralFeeAmount: 0,
    },
    mode: 'onChange',
  })

  return <FormProvider {...methods}>{children}</FormProvider>
}

export const useEditReferralFormData = () =>
  useFormContext<EditReferralFormData>()
