import { passwordLengthConfig } from '@core/config/password'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@lib/ui/buttons/Button'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { CircleInfoIcon } from '@lib/ui/icons/CircleInfoIcon'
import { PasswordInput } from '@lib/ui/inputs/PasswordInput'
import { ScreenLayout } from '@lib/ui/layout/ScreenLayout/ScreenLayout'
import { VStack } from '@lib/ui/layout/Stack'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { Tooltip } from '@lib/ui/tooltips/Tooltip'
import { ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { z } from 'zod'

import { StepConfig, StepProgressIndicator } from './StepProgressIndicator'

type VaultPasswordStepOutput = {
  password: string
}

type VaultPasswordStepProps = OnFinishProp<VaultPasswordStepOutput> &
  OnBackProp & {
    steps?: readonly StepConfig[]
    stepIndex?: number
    headerRight?: ReactNode
  }

export const VaultPasswordStep = ({
  onFinish,
  onBack,
  steps,
  stepIndex,
  headerRight,
}: VaultPasswordStepProps) => {
  const { t } = useTranslation()

  const passwordMessage = t('password_pattern_error', passwordLengthConfig)

  const schema = z
    .object({
      password: z
        .string()
        .min(passwordLengthConfig.min, passwordMessage)
        .max(passwordLengthConfig.max, passwordMessage),
      confirmPassword: z.string(),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: t('password_do_not_match'),
      path: ['confirmPassword'],
    })

  type Schema = z.infer<typeof schema>

  const {
    formState: { errors, isValid },
    register,
    handleSubmit,
  } = useForm<Schema>({
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'all',
    resolver: zodResolver(schema),
  })

  const onSubmit = ({ password }: Schema) => {
    onFinish({ password })
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <ScreenLayout
        onBack={onBack}
        headerRight={headerRight}
        footer={
          <Button style={{ width: '100%' }} disabled={!isValid} type="submit">
            {t('create_vault')}
          </Button>
        }
      >
        <Content>
          {steps && stepIndex !== undefined && (
            <StepProgressIndicator steps={steps} currentStepIndex={stepIndex} />
          )}
          <VStack gap={8}>
            <Title
              centerHorizontally
              as="h1"
              size={22}
              weight={500}
              color="contrast"
            >
              {t('choose_a_password')}
            </Title>
            <SubtitleRow>
              <Text centerHorizontally color="shy" size={14} as="span">
                <Trans
                  i18nKey="choose_a_password_description"
                  components={{
                    b: <Text as="span" weight={600} color="contrast" />,
                  }}
                />
              </Text>
              <Tooltip
                content={t('fastVaultSetup.passwordTooltip')}
                placement="top"
                renderOpener={openerProps => (
                  <InfoIconTrigger {...openerProps}>
                    <CircleInfoIcon />
                  </InfoIconTrigger>
                )}
              />
            </SubtitleRow>
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
                isValid
                  ? 'valid'
                  : errors.confirmPassword
                    ? 'invalid'
                    : undefined
              }
            />
          </VStack>
        </Content>
      </ScreenLayout>
    </Form>
  )
}

const Form = styled.form`
  height: 100%;
`

const Content = styled(VStack)`
  flex: 1;
  gap: 24px;
  padding-top: 24px;
`

const Title = styled(Text)`
  letter-spacing: -0.36px;
  line-height: 24px;
`

const SubtitleRow = styled.div`
  display: inline;
  line-height: 1.4;
`

const InfoIconTrigger = styled(UnstyledButton)`
  display: inline-flex;
  vertical-align: middle;
  color: ${getColor('text')};
  font-size: 14px;
  margin-left: 4px;
`
