import { Button } from '@lib/ui/buttons/Button'
import { PasswordInput } from '@lib/ui/inputs/PasswordInput'
import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { Text } from '@lib/ui/text'
import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { formatToolName } from '../utils/formatToolName'

type Props = {
  toolName: string
  operation: string
  description?: string
  error?: string | null
  isLoading?: boolean
  onSubmit: (password: string) => void
  onCancel: () => void
}

export const PasswordPrompt: FC<Props> = ({
  toolName,
  operation,
  description,
  error,
  isLoading,
  onSubmit,
  onCancel,
}) => {
  const { t } = useTranslation()
  const [password, setPassword] = useState('')

  const handleSubmit = () => {
    if (password) {
      onSubmit(password)
    }
  }

  return (
    <Modal
      title={t('password_required')}
      onClose={onCancel}
      footer={
        <VStack gap={8} fullWidth>
          <Button
            onClick={handleSubmit}
            disabled={!password || isLoading}
          >
            {isLoading ? 'Signing in...' : t('continue')}
          </Button>
          <Button kind="outlined" onClick={onCancel} disabled={isLoading}>
            {t('cancel')}
          </Button>
        </VStack>
      }
    >
      <VStack gap={16}>
        {description ? (
          <Text size={14} color="supporting">
            {description}
          </Text>
        ) : (
          <>
            <Text size={14} color="supporting">
              {t('password_required_for_operation', { operation })}
            </Text>
            <Text size={12} color="supporting">
              Tool: {formatToolName(toolName)}
            </Text>
          </>
        )}
        {error && (
          <Text size={13} color="danger">
            {error}
          </Text>
        )}
        <PasswordInput
          value={password}
          onValueChange={setPassword}
          placeholder={t('enter_password')}
          autoFocus
        />
      </VStack>
    </Modal>
  )
}
