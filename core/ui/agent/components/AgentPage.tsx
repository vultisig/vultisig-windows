import { getVaultId } from '@core/mpc/vault/Vault'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { BurgerOpenIcon } from '../icons/BurgerOpenIcon'
import { PencilWaveIcon } from '../icons/PencilWaveIcon'
import { useAgentConversationsQuery } from '../queries/useAgentConversationsQuery'
import { AgentHeaderButton } from './AgentHeaderButton'
import { AgentHistoryView } from './AgentHistoryView'

export const AgentPage: FC = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const vault = useCurrentVault()

  const vaultId = vault ? getVaultId(vault) : null
  const conversationsQuery = useAgentConversationsQuery(vaultId)

  const handleNewChat = () => {
    navigate({ id: 'agentChat', state: {} })
  }

  const handleOpenChat = (conversationId: string) => {
    navigate({ id: 'agentChat', state: { conversationId } })
  }

  const content = (() => {
    if (vaultId === null) {
      return (
        <AgentHistoryView
          state="empty"
          onNewChat={handleNewChat}
          onOpenChat={handleOpenChat}
        />
      )
    }

    if (conversationsQuery.error) {
      return (
        <AgentHistoryView
          state="error"
          error={
            conversationsQuery.error instanceof Error
              ? conversationsQuery.error.message
              : undefined
          }
          onNewChat={handleNewChat}
          onOpenChat={handleOpenChat}
          onRetry={() => {
            void conversationsQuery.refetch()
          }}
        />
      )
    }

    if (conversationsQuery.isPending && conversationsQuery.data === undefined) {
      return (
        <AgentHistoryView
          state="loading"
          onNewChat={handleNewChat}
          onOpenChat={handleOpenChat}
        />
      )
    }

    const conversations = conversationsQuery.data ?? []

    return (
      <AgentHistoryView
        state={conversations.length === 0 ? 'empty' : 'loaded'}
        conversations={conversations}
        onNewChat={handleNewChat}
        onOpenChat={handleOpenChat}
      />
    )
  })()

  return (
    <VStack fullHeight>
      <Header>
        <HStack gap={14} alignItems="center" fullWidth>
          <AgentHeaderButton onClick={handleNewChat}>
            <BurgerOpenIcon />
          </AgentHeaderButton>
          <Text
            style={{ flex: 1 }}
            size={16}
            weight={400}
            height="large"
            color="contrast"
          >
            {t('session_history')}
          </Text>
          <AgentHeaderButton onClick={handleNewChat}>
            <PencilWaveIcon />
          </AgentHeaderButton>
        </HStack>
      </Header>
      {content}
    </VStack>
  )
}

const Header = styled.div`
  display: flex;
  align-items: center;
  min-height: 56px;
  padding: 12px 16px;
  border-bottom: 1px solid ${getColor('foregroundExtra')};
`
