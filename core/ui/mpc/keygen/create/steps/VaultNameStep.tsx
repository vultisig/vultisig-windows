import { useVaultNames } from '@core/ui/storage/vaults'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@lib/ui/buttons/Button'
import { ScreenLayout } from '@lib/ui/layout/ScreenLayout/ScreenLayout'
import { VStack } from '@lib/ui/layout/Stack'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { z } from 'zod'

import { ClearableTextInput } from '../components/ClearableTextInput'
import { useGeneratedVaultName } from '../hooks/useGeneratedVaultName'
import { getVaultNameSchema } from '../utils/getVaultNameSchema'
import { StepConfig, StepProgressIndicator } from './StepProgressIndicator'

type VaultNameStepOutput = {
  name: string
}

type VaultNameStepProps = OnFinishProp<VaultNameStepOutput> &
  Partial<OnBackProp> & {
    steps?: readonly StepConfig[]
    stepIndex?: number
    headerRight?: ReactNode
  }

export const VaultNameStep = ({
  onFinish,
  onBack,
  steps,
  stepIndex,
  headerRight,
}: VaultNameStepProps) => {
  const { t } = useTranslation()
  const existingVaultNames = useVaultNames()
  const generatedName = useGeneratedVaultName()

  const schema = z.object({
    name: getVaultNameSchema(t, existingVaultNames),
  })

  const {
    formState: { errors, isValid },
    handleSubmit,
    setValue,
    watch,
  } = useForm<{ name: string }>({
    defaultValues: { name: generatedName },
    mode: 'all',
    resolver: zodResolver(schema),
  })

  const name = watch('name')

  const onSubmit = () => {
    onFinish({ name })
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <ScreenLayout
        onBack={onBack}
        headerRight={headerRight}
        footer={
          <Button style={{ width: '100%' }} disabled={!isValid} type="submit">
            {t('next')}
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
              {t('name_your_vault')}
            </Title>
            <Text centerHorizontally color="shy" size={14}>
              {t('vault_name_description')}
            </Text>
          </VStack>
          <VStack gap={16}>
            <ClearableTextInput
              placeholder={t('enter_vault_name')}
              value={name}
              onValueChange={v => setValue('name', v, { shouldValidate: true })}
              onClear={() => setValue('name', '', { shouldValidate: true })}
              validation={errors.name ? 'invalid' : name ? 'valid' : undefined}
              autoFocus
            />
            {errors.name?.message && (
              <Text color="danger" size={12}>
                {errors.name.message}
              </Text>
            )}
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
