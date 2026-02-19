import { useVaultNames } from '@core/ui/storage/vaults'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@lib/ui/buttons/Button'
import { ScreenLayout } from '@lib/ui/layout/ScreenLayout/ScreenLayout'
import { VStack } from '@lib/ui/layout/Stack'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { z } from 'zod'

import { ClearableTextInput } from '../components/ClearableTextInput'
import { ReferralExpandableField } from '../components/ReferralExpandableField'
import { useGeneratedVaultName } from '../hooks/useGeneratedVaultName'
import { getVaultNameSchema } from '../utils/getVaultNameSchema'

type VaultNameStepOutput = {
  name: string
  referral?: string
}

type VaultNameStepProps = OnFinishProp<VaultNameStepOutput> &
  Partial<OnBackProp>

export const VaultNameStep = ({ onFinish, onBack }: VaultNameStepProps) => {
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
  const [referral, setReferral] = useState('')

  const handleNext = () => {
    if (!isValid) return
    onFinish({
      name,
      referral: referral || undefined,
    })
  }

  return (
    <ScreenLayout
      onBack={onBack}
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
        <ReferralExpandableField value={referral} onValueChange={setReferral} />
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
