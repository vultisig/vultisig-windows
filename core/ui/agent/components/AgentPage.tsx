import { getVaultId } from '@core/mpc/vault/Vault'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { BottomNavigation } from '@core/ui/vault/components/BottomNavigation'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { PlusIcon } from '@lib/ui/icons/PlusIcon'
import { SparklesIcon } from '@lib/ui/icons/SparklesIcon'
import { TrashIcon } from '@lib/ui/icons/TrashIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useAgentService } from '../hooks/useAgentService'
import { useConversationStarters } from '../hooks/useConversationStarters'
import { Conversation } from '../types'
import { ChatInput } from './ChatInput'
import { ConnectionButton } from './ConnectionButton'
import { ConversationStarters } from './ConversationStarters'

export const AgentPage: FC = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const vault = useCurrentVault()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [refreshKey, setRefreshKey] = useState(0)

  const { getConversations, deleteConversation } = useAgentService()

  const vaultId = vault ? getVaultId(vault) : null
  const { starters } = useConversationStarters(vaultId)

  useEffect(() => {
    if (!vaultId) return
    getConversations(vaultId)
      .then(convs => setConversations(convs || []))
      .catch(() => setConversations(prev => (prev.length === 0 ? prev : [])))
  }, [vaultId, refreshKey, getConversations])

  const handleNewChat = (initialMessage?: string) => {
    if (!vaultId) return
    navigate({
      id: 'agentChat',
      state: { initialMessage },
    })
  }

  const handleOpenChat = (conversationId: string) => {
    navigate({ id: 'agentChat', state: { conversationId } })
  }

  const handleDeleteChat = async (
    e: React.MouseEvent,
    conversationId: string
  ) => {
    e.stopPropagation()
    if (!vaultId) return
    await deleteConversation(conversationId, vaultId)
    setRefreshKey(k => k + 1)
  }

  return (
    <VStack fullHeight>
      <PageHeader
        title={t('vultibot')}
        hasBorder
        secondaryControls={
          <HStack gap={8} alignItems="center">
            <ConnectionButton />
            <NewChatButton onClick={() => handleNewChat()}>
              <PlusIcon />
            </NewChatButton>
          </HStack>
        }
      />
      <PageContent>
        {conversations.length === 0 ? (
          <EmptyState>
            <VStack gap={20} alignItems="center">
              <IconWrapper>
                <SparklesIcon />
              </IconWrapper>
              <Text size={20} weight={600}>
                {t('vultibot_welcome')}
              </Text>
              <DescriptionText size={14} color="supporting">
                {t('vultibot_description')}
              </DescriptionText>
              <ConversationStarters
                starters={starters}
                onSelect={starter => handleNewChat(starter)}
              />
            </VStack>
          </EmptyState>
        ) : (
          <VStack gap={8}>
            {conversations.map(conv => (
              <ConversationItem
                key={conv.id}
                onClick={() => handleOpenChat(conv.id)}
              >
                <HStack
                  gap={12}
                  alignItems="center"
                  justifyContent="space-between"
                  fullWidth
                >
                  <VStack gap={4}>
                    <Text size={14} weight={500}>
                      {conv.title || t('new_chat')}
                    </Text>
                  </VStack>
                  <DeleteButton onClick={e => handleDeleteChat(e, conv.id)}>
                    <TrashIcon />
                  </DeleteButton>
                </HStack>
              </ConversationItem>
            ))}
          </VStack>
        )}
      </PageContent>
      <ChatInput
        onSend={handleNewChat}
        placeholder={t('ask_about_plugins_policies')}
      />
      <BottomNavigation activeTab="agent" />
    </VStack>
  )
}

const NewChatButton = styled(UnstyledButton)`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${getColor('foreground')};
  color: ${getColor('contrast')};
  font-size: 16px;

  &:hover {
    background: ${getColor('foregroundExtra')};
  }
`

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 24px;
`

const DescriptionText = styled(Text)`
  text-align: center;
  max-width: 300px;
`

const IconWrapper = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    ${getColor('primary')} 0%,
    ${getColor('primaryAccentTwo')} 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: ${getColor('contrast')};
`

const ConversationItem = styled.div`
  width: 100%;
  padding: 16px;
  border-radius: 12px;
  background: ${getColor('foreground')};
  text-align: left;
  cursor: pointer;

  &:hover {
    background: ${getColor('foregroundExtra')};
  }
`

const DeleteButton = styled(UnstyledButton)`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${getColor('textShy')};
  font-size: 16px;

  &:hover {
    background: ${getColor('foregroundExtra')};
    color: ${getColor('danger')};
  }
`
