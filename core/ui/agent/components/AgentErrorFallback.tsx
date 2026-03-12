import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const AgentErrorFallbackContent: FC<{ clearError: () => void }> = ({
  clearError,
}) => {
  const { t } = useTranslation()

  return (
    <ErrorContainer gap={12} alignItems="center">
      <Text size={14} color="danger">
        {t('agent_chat_render_error')}
      </Text>
      <RetryText size={13} color="primary" onClick={clearError}>
        {t('try_again')}
      </RetryText>
    </ErrorContainer>
  )
}

export const AgentErrorFallback: FC<{ clearError: () => void }> = ({
  clearError,
}) => <AgentErrorFallbackContent clearError={clearError} />

const ErrorContainer = styled(VStack)`
  padding: 24px;
`

const RetryText = styled(Text)`
  cursor: pointer;
`
