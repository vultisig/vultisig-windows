import { passwordLengthConfig } from '@core/config/password'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@lib/ui/buttons/Button'
import { useBoolean } from '@lib/ui/hooks/useBoolean'
import { CircleInfoIcon } from '@lib/ui/icons/CircleInfoIcon'
import { PasswordInput } from '@lib/ui/inputs/PasswordInput'
import { TextArea } from '@lib/ui/inputs/TextArea'
import { CollapsableStateIndicator } from '@lib/ui/layout/CollapsableStateIndicator'
import { ScreenLayout } from '@lib/ui/layout/ScreenLayout/ScreenLayout'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { WarningBlock } from '@lib/ui/status/WarningBlock'
import { Text } from '@lib/ui/text'
import { AnimatePresence, motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { z } from 'zod'

type VaultPasswordStepOutput = {
  password: string
  hint?: string
}

type VaultPasswordStepProps = OnFinishProp<VaultPasswordStepOutput> & OnBackProp

export const VaultPasswordStep = ({
  onFinish,
  onBack,
}: VaultPasswordStepProps) => {
  const { t } = useTranslation()
  const [isHintExpanded, { toggle: toggleHint }] = useBoolean(false)

  const passwordMessage = t('password_pattern_error', passwordLengthConfig)

  const schema = z
    .object({
      password: z
        .string()
        .min(passwordLengthConfig.min, passwordMessage)
        .max(passwordLengthConfig.max, passwordMessage),
      confirmPassword: z.string(),
      hint: z.string().optional(),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: t('password_do_not_match'),
      path: ['confirmPassword'],
    })

  type Schema = z.infer<typeof schema>

  const {
    formState: { errors, isValid },
    register,
    watch,
    setValue,
    handleSubmit,
  } = useForm<Schema>({
    defaultValues: { password: '', confirmPassword: '', hint: '' },
    mode: 'all',
    resolver: zodResolver(schema),
  })

  const hintValue = watch('hint')

  const onSubmit = ({ password, hint }: Schema) => {
    onFinish({ password, hint: hint || undefined })
  }

  return (
    <ScreenLayout
      onBack={onBack}
      footer={
        <VStack gap={16}>
          <WarningBlock icon={CircleInfoIcon}>
            {t('fastVaultSetup.passwordCannotBeRecovered')}
          </WarningBlock>
          <Button
            style={{ width: '100%' }}
            disabled={!isValid}
            onClick={handleSubmit(onSubmit)}
          >
            {t('get_started')}
          </Button>
        </VStack>
      }
    >
      <Content>
        <VStack gap={8}>
          <Title as="h1" size={22} weight={500} color="contrast">
            {t('choose_a_password')}
          </Title>
          <Text color="shy" size={14}>
            {t('choose_a_password_description')}
          </Text>
        </VStack>
        <VStack gap={12}>
          <PasswordInput
            {...register('password')}
            error={errors.password?.message}
            placeholder={t('enter_password')}
            validation={
              isValid ? 'valid' : errors.password ? 'invalid' : undefined
            }
            autoFocus
          />
          <PasswordInput
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
            placeholder={t('verify_password')}
            validation={
              isValid ? 'valid' : errors.confirmPassword ? 'invalid' : undefined
            }
          />
        </VStack>
        <VStack gap={8}>
          <HStack
            alignItems="center"
            justifyContent="space-between"
            onClick={toggleHint}
            style={{ cursor: 'pointer' }}
          >
            <Text color="shy" size={14}>
              {t('fastVaultSetup.addOptionalHint')}
            </Text>
            <CollapsableStateIndicator isOpen={isHintExpanded} />
          </HStack>
          <AnimatePresence>
            {isHintExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden' }}
              >
                <VStack gap={20} padding="8px 0 0 0">
                  <VStack gap={12}>
                    <Text as="span" size={28}>
                      {t('fastVaultSetup.addAnOptionalHint')}
                    </Text>
                    <Text as="span" color="shy" size={14}>
                      {t('fastVaultSetup.hintDescription')}
                    </Text>
                  </VStack>
                  <TextArea
                    {...register('hint')}
                    value={hintValue}
                    onValueChange={v =>
                      setValue('hint', v, { shouldValidate: true })
                    }
                    placeholder={t('fastVaultSetup.enterHint')}
                  />
                </VStack>
              </motion.div>
            )}
          </AnimatePresence>
        </VStack>
      </Content>
    </ScreenLayout>
  )
}

const Content = styled(VStack)`
  flex: 1;
  gap: 24px;
  padding-top: 24px;
`

const Title = styled(Text)`
  letter-spacing: -0.36px;
  line-height: 24px;
`
