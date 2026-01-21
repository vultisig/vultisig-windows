import { zodResolver } from '@hookform/resolvers/zod'
import { ChildrenProp } from '@lib/ui/props'
import { TFunction } from 'i18next'
import { useMemo } from 'react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

const createReferralSchema = (t: TFunction) =>
  z.object({
    referralName: z
      .string()
      .max(4, t('max_4_characters'))
      .regex(/^\S+$/, t('referral_code_no_whitespace'))
      .nonempty(t('referral_code_required')),
    expiration: z
      .number()
      .min(1, t('referral_expiration_minimum'))
      .max(1000, t('referral_expiration_maximum')),
    referralFeeAmount: z
      .number()
      .min(0.1, t('referral_fee_amount_minimum', { amount: 0.1 })),
  })

type CreateReferralFormData = z.infer<ReturnType<typeof createReferralSchema>>

export const CreateReferralFormProvider = ({ children }: ChildrenProp) => {
  const { t } = useTranslation()
  const referralSchema = useMemo(() => createReferralSchema(t), [t])

  const methods = useForm<CreateReferralFormData>({
    resolver: zodResolver(referralSchema),
    defaultValues: { referralName: '', expiration: 1, referralFeeAmount: 0 },
    mode: 'onChange',
  })

  return <FormProvider {...methods}>{children}</FormProvider>
}

export const useCreateReferralForm = () =>
  useFormContext<CreateReferralFormData>()
