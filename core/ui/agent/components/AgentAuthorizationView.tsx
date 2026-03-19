import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { AgentOrb } from '../icons/AgentOrb'
import { AgentChatFooter } from './AgentChatFooter'

type AgentAuthorizationViewProps = {
  onSubmit: (password: string) => void
  onCancel: () => void
  error?: string | null
  isLoading?: boolean
}

/** Full-screen authorization view shown when the user first opens the agent and is not yet authenticated. */
export const AgentAuthorizationView: FC<AgentAuthorizationViewProps> = ({
  onSubmit,
  onCancel,
  error,
  isLoading,
}) => {
  const { t } = useTranslation()
  const [password, setPassword] = useState('')

  const handleSubmit = () => {
    const trimmed = password.trim()
    if (trimmed) {
      onSubmit(trimmed)
    }
  }

  const handleCancel = () => {
    setPassword('')
    onCancel()
  }

  return (
    <Container>
      <GradientBackground />
      <ContentArea>
        <VStack gap={48} alignItems="center">
          <AgentOrb />
          <VStack gap={16} alignItems="center">
            <TitleText size={22} weight={500}>
              {t('welcome_to_vulti_agent')}
            </TitleText>
            <DescriptionText variant="caption" color="shy" centerHorizontally>
              {t('agent_welcome_description')}
            </DescriptionText>
          </VStack>
        </VStack>
      </ContentArea>
      <AgentChatFooter
        mode="password"
        value={password}
        onChange={setPassword}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        error={error}
        label={t('authorize_agent')}
        isLoading={isLoading}
      />
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  overflow: clip;
  overflow-clip-margin: 0px;
`

const GradientBackground = styled.div`
  position: absolute;
  top: -40%;
  left: -30%;
  right: -30%;
  height: 110%;
  pointer-events: none;
  z-index: 0;
  background:
    radial-gradient(
      ellipse 50% 45% at 50% 20%,
      hsla(224, 100%, 50%, 0.9) 0%,
      hsla(222, 95%, 42%, 0.45) 25%,
      hsla(218, 85%, 28%, 0.15) 50%,
      transparent 75%
    ),
    radial-gradient(
      ellipse 30% 35% at 50% 25%,
      hsla(224, 100%, 60%, 0.5) 0%,
      hsla(220, 90%, 45%, 0.15) 45%,
      transparent 70%
    );
`

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
  z-index: 1;
`

const TitleText = styled(Text)`
  text-align: center;
  letter-spacing: -0.36px;
`

const DescriptionText = styled(Text)`
  max-width: 295px;
`
