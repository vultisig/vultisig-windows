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
import { StepProgressIndicator } from './StepProgressIndicator'
import { vaultSetupSteps } from './vault-setup-steps'

type VaultNameStepOutput = {
  name: string
}

type VaultNameStepProps = OnFinishProp<VaultNameStepOutput> &
  Partial<OnBackProp> & {
    stepIndex?: number
    headerRight?: ReactNode
  }

export const VaultNameStep = ({
  onFinish,
  onBack,
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
    setValue,
    watch,
  } = useForm<{ name: string }>({
    defaultValues: { name: generatedName },
    mode: 'all',
    resolver: zodResolver(schema),
  })

  const name = watch('name')

  const handleNext = () => {
    if (!isValid) return
    onFinish({ name })
  }

  return (
    <ScreenLayout
      onBack={onBack}
      headerRight={headerRight}
      footer={
        <Button
          style={{ width: '100%' }}
          disabled={!isValid}
          onClick={handleNext}
        >
          {t('next')}
        </Button>
      }
    >
      <Content>
        {stepIndex !== undefined && (
          <StepProgressIndicator
            steps={vaultSetupSteps}
            currentStepIndex={stepIndex}
          />
        )}
        <VStack gap={8}>
          <Title as="h1" size={22} weight={500} color="contrast">
            {t('name_your_vault')}
          </Title>
          <Text color="shy" size={14}>
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
