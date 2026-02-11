import { ActionFieldDivider } from '@core/ui/vault/components/action-form/ActionFieldDivider'
import { ActionInputContainer } from '@core/ui/vault/components/action-form/ActionInputContainer'
import { StackedField } from '@core/ui/vault/send/StackedField'
import { useBoolean } from '@lib/ui/hooks/useBoolean'
import { CircleInfoIcon } from '@lib/ui/icons/CircleInfoIcon'
import { InputLabel } from '@lib/ui/inputs/InputLabel'
import { PasswordInput } from '@lib/ui/inputs/PasswordInput'
import { TextArea } from '@lib/ui/inputs/TextArea'
import { CollapsableStateIndicator } from '@lib/ui/layout/CollapsableStateIndicator'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { WarningBlock } from '@lib/ui/status/WarningBlock'
import { Text } from '@lib/ui/text'
import { AnimatePresence, motion } from 'framer-motion'
import { UseFormRegisterReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { CollapsedFormField } from './CollapsedFormField'

type PasswordFormSectionProps = {
  isExpanded: boolean
  onToggle: () => void
  onCollapsedFocus?: () => void
  passwordRegister: UseFormRegisterReturn<'password'>
  confirmPasswordRegister: UseFormRegisterReturn<'confirmPassword'>
  hintRegister: UseFormRegisterReturn<'hint'>
  passwordError?: string
  confirmPasswordError?: string
  passwordValue: string
  confirmPasswordValue: string
  hintValue: string
  onPasswordChange: (value: string) => void
  onConfirmPasswordChange: (value: string) => void
  onHintChange: (value: string) => void
}

export const PasswordFormSection = ({
  isExpanded,
  onToggle,
  onCollapsedFocus,
  passwordRegister,
  confirmPasswordRegister,
  hintRegister,
  passwordError,
  confirmPasswordError,
  passwordValue,
  hintValue,
  onPasswordChange,
  onConfirmPasswordChange,
  onHintChange,
}: PasswordFormSectionProps) => {
  const { t } = useTranslation()
  const [isHintExpanded, { toggle: toggleHint }] = useBoolean(!!hintValue)

  return (
    <StackedField
      isOpen={isExpanded}
      renderClose={() => (
        <CollapsedFormField
          title={t('password')}
          valuePreview={passwordValue ? '********' : undefined}
          isValid={!passwordError && !confirmPasswordError && !!passwordValue}
          onClick={onToggle}
          onCollapsedFocus={onCollapsedFocus}
        />
      )}
      renderOpen={() => (
        <ActionInputContainer>
          <InputLabel>{t('password')}</InputLabel>
          <ActionFieldDivider />
          <VStack gap={20}>
            <WarningBlock icon={CircleInfoIcon}>
              {t('fastVaultSetup.passwordCannotBeRecovered')}
            </WarningBlock>

            <VStack gap={12}>
              <PasswordInput
                {...passwordRegister}
                placeholder={t('enter_password')}
                error={passwordError}
                onValueChange={onPasswordChange}
              />
              <PasswordInput
                {...confirmPasswordRegister}
                placeholder={t('verify_password')}
                error={confirmPasswordError}
                onValueChange={onConfirmPasswordChange}
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
                        {...hintRegister}
                        value={hintValue}
                        onValueChange={onHintChange}
                        placeholder={t('fastVaultSetup.enterHint')}
                      />
                    </VStack>
                  </motion.div>
                )}
              </AnimatePresence>
            </VStack>
          </VStack>
        </ActionInputContainer>
      )}
    />
  )
}
