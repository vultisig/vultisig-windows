import { Button } from '@lib/ui/buttons/Button'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { Text } from '@lib/ui/text'
import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'

type ReauthorizeAgentDialogProps = {
  onAuthorize: () => Promise<void>
  onCancel: () => void
}

/** Dialog shown when the agent session expires and the user needs to re-authorize using a cached password. */
export const ReauthorizeAgentDialog: FC<ReauthorizeAgentDialogProps> = ({
  onAuthorize,
  onCancel,
}) => {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAuthorize = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await onAuthorize()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t('agent_sign_in_failed')
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      title={t('reauthorize_vulti_agent')}
      onClose={onCancel}
      footer={
        <HStack gap={12} fullWidth>
          <Button kind="secondary" onClick={onCancel} disabled={isLoading}>
            {t('cancel')}
          </Button>
          <Button onClick={handleAuthorize} loading={isLoading}>
            {t('authorize')}
          </Button>
        </HStack>
      }
    >
      <VStack gap={24} alignItems="center">
        <Text size={14} weight={500} color="shy" centerHorizontally>
          {t('agent_reauth_description')}
        </Text>
        {error && (
          <Text size={13} color="danger">
            {error}
          </Text>
        )}
      </VStack>
    </Modal>
  )
}
