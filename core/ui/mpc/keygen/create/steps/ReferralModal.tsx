import { useReferralValidation } from '@core/ui/vault/settings/referral/hooks/useReferralValidation'
import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { ResponsiveModal } from '@lib/ui/modal/ResponsiveModal'
import { Text } from '@lib/ui/text'
import { Trans, useTranslation } from 'react-i18next'

import { ClearableTextInput } from '../components/ClearableTextInput'

type ReferralModalProps = {
  isOpen: boolean
  onClose: () => void
  referralCode: string
  onReferralCodeChange: (value: string) => void
  onApply: () => void
}

export const ReferralModal = ({
  isOpen,
  onClose,
  referralCode,
  onReferralCodeChange,
  onApply,
}: ReferralModalProps) => {
  const { t } = useTranslation()
  const trimmedReferralCode = referralCode.trim()
  const error = useReferralValidation(trimmedReferralCode)

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
            value={referralCode}
            onValueChange={onReferralCodeChange}
            onClear={() => onReferralCodeChange('')}
            validation={error ? 'invalid' : undefined}
          />
          {error && (
            <Text color="danger" size={12}>
              {error}
            </Text>
          )}
        </VStack>
        <Button
          style={{ width: '100%' }}
          disabled={!trimmedReferralCode || !!error}
          onClick={onApply}
        >
          {t('fastVaultSetup.applyReferral')}
        </Button>
      </VStack>
    </ResponsiveModal>
  )
}
