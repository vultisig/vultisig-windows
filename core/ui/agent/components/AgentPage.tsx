import { getVaultId } from '@core/mpc/vault/Vault'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useAgentService } from '../hooks/useAgentService'
import { BurgerOpenIcon } from '../icons/BurgerOpenIcon'
import { PencilWaveIcon } from '../icons/PencilWaveIcon'
import { Conversation } from '../types'
import { AgentHeaderButton } from './AgentHeaderButton'

export const AgentPage: FC = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const vault = useCurrentVault()
  const [conversations, setConversations] = useState<Conversation[]>([])

  const { getConversations } = useAgentService()

  const vaultId = vault ? getVaultId(vault) : null

  useEffect(() => {
    if (!vaultId) return
    getConversations(vaultId)
      .then(convs => setConversations(convs || []))
      .catch(() => {})
  }, [vaultId, getConversations])

  const handleNewChat = () => {
    navigate({ id: 'agentChat', state: {} })
  }

  const handleOpenChat = (conversationId: string) => {
    navigate({ id: 'agentChat', state: { conversationId } })
  }

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
      <ConversationList>
        <VStack gap={14}>
          {conversations.map(conv => (
            <ConversationItem
              key={conv.id}
              onClick={() => handleOpenChat(conv.id)}
            >
              <Text size={16} weight={400} height="large" color="contrast">
                {conv.title || t('new_chat')}
              </Text>
            </ConversationItem>
          ))}
        </VStack>
      </ConversationList>
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

const ConversationList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px;
`

const ConversationItem = styled(UnstyledButton)`
  width: 100%;
  padding: 14px;
  border-radius: 14px;
  text-align: left;
  cursor: pointer;

  &:hover {
    background: ${getColor('foreground')};
  }
`
