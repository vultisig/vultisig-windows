import { useReferralValidation } from '@core/ui/vault/settings/referral/hooks/useReferralValidation'
import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { ResponsiveModal } from '@lib/ui/modal/ResponsiveModal'
import { Text } from '@lib/ui/text'
import { useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import { ClearableTextInput } from '../components/ClearableTextInput'

type ReferralModalProps = {
  isOpen: boolean
  onClose: () => void
  initialCode: string
  onApply: (code: string) => void
}

export const ReferralModal = ({
  isOpen,
  onClose,
  initialCode,
  onApply,
}: ReferralModalProps) => {
  const { t } = useTranslation()
  const [inputValue, setInputValue] = useState(initialCode)
  const trimmedValue = inputValue.trim()
  const error = useReferralValidation(trimmedValue)

  useEffect(() => {
    if (isOpen) {
      setInputValue(initialCode)
    }
  }, [isOpen, initialCode])

  return (
    <ResponsiveModal isOpen={isOpen} onClose={onClose} grabbable>
      <VStack gap={24} style={{ padding: '24px' }}>
        <VStack gap={8}>
          <Text as="h2" size={22} weight={500} color="contrast">
            {t('fastVaultSetup.referralModalTitle')}
          </Text>
          <Text color="shy" size={14}>
            <Trans
              i18nKey="fastVaultSetup.referralModalSubtitle"
              components={{
                b: <Text as="span" weight={600} color="contrast" />,
              }}
            />
          </Text>
        </VStack>
        <VStack gap={8}>
          <ClearableTextInput
            placeholder={t('enter_up_to_4_characters_placeholder')}
            value={inputValue}
            onValueChange={setInputValue}
            onClear={() => setInputValue('')}
            validation={error ? 'invalid' : undefined}
            maxLength={4}
          />
          {error && (
            <Text color="danger" size={12}>
              {error}
            </Text>
          )}
        </VStack>
        <Button
          style={{ width: '100%' }}
          disabled={!trimmedValue || !!error}
          onClick={() => onApply(trimmedValue)}
        >
          {t('fastVaultSetup.applyReferral')}
        </Button>
      </VStack>
    </ResponsiveModal>
  )
}
