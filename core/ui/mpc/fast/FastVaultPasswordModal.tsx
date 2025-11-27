import { Button } from '@lib/ui/buttons/Button'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { CrossIcon } from '@lib/ui/icons/CrossIcon'
import { FocusLockIcon } from '@lib/ui/icons/FocusLockIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { PasswordInput } from '@lib/ui/inputs/PasswordInput'
import { VStack } from '@lib/ui/layout/Stack'
import { Backdrop } from '@lib/ui/modal/Backdrop'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type FastVaultPasswordModalProps = OnBackProp &
  OnFinishProp<{
    password: string
  }> & {
    error?: Error | null
    isPending?: boolean
    title?: string
    description?: string
    showModal?: boolean
  }

export const FastVaultPasswordModal: React.FC<FastVaultPasswordModalProps> = ({
  showModal,
  onFinish,
  onBack,
  error,
  isPending = false,
  title,
  description,
}) => {
  const [password, setPassword] = useState('')
  const { t } = useTranslation()

  const isDisabled = useMemo(() => !password, [password])

  return showModal ? (
    <Backdrop onClose={onBack}>
      <ModalWrapper>
        <CloseButton onClick={onBack}>
          <CrossIcon />
        </CloseButton>

        <IconWrapper size={32} color="buttonPrimary">
          <FocusLockIcon />
        </IconWrapper>

        <VStack gap={8} alignItems="center">
          <Text size={17} weight={500} centerHorizontally>
            {title ?? t('enter_your_password')}
          </Text>
          <Text size={12} color="shy" centerHorizontally>
            {description ?? t('verify_password_periodic_message_description')}
          </Text>
        </VStack>

        <VStack gap={16} fullWidth>
          <PasswordInput
            placeholder={t('enter_password')}
            value={password}
            onValueChange={value => {
              if (isPending) return
              setPassword(value)
            }}
            validation={error ? 'invalid' : undefined}
            error={error ? t('incorrect_password') : undefined}
          />

          <ConfirmButton
            disabled={isDisabled || isPending}
            loading={isPending}
            onClick={() => onFinish({ password })}
            kind="primary"
          >
            {t('confirm')}
          </ConfirmButton>
        </VStack>
      </ModalWrapper>
    </Backdrop>
  ) : null
}

const CloseButton = styled(IconButton)`
  display: flex;
  padding: 8px;
  align-items: center;
  gap: 10px;

  position: absolute;
  right: 12px;
  top: 12px;
  border-radius: 99px;
  background: ${getColor('foregroundExtra')};
`

const ModalWrapper = styled(VStack)`
  position: relative;
  display: flex;
  width: 311px;
  padding: 32px 24px 24px 24px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 24px;
  border-radius: 24px;
  border: 1px solid #11284a;
  background: #02122b;
`

const ConfirmButton = styled(Button)`
  width: 100%;
  height: 48px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
`
