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
import { FC, useCallback, useEffect, useState } from 'react'
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

  const { getConversations, deleteConversation } = useAgentService()

  const vaultId = vault ? getVaultId(vault) : null
  const { starters } = useConversationStarters(vaultId)

  const loadConversations = useCallback(async () => {
    if (!vaultId) return
    try {
      const convs = await getConversations(vaultId)
      setConversations(convs || [])
    } catch {
      setConversations(prev => (prev.length === 0 ? prev : []))
    }
  }, [vaultId, getConversations])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  const handleNewChat = useCallback(
    async (initialMessage?: string) => {
      if (!vaultId) return
      try {
        navigate({
          id: 'agentChat',
          state: { initialMessage },
        })
      } catch (err) {
        console.error('Failed to create conversation:', err)
      }
    },
    [vaultId, navigate]
  )

  const handleOpenChat = useCallback(
    (conversationId: string) => {
      navigate({ id: 'agentChat', state: { conversationId } })
    },
    [navigate]
  )

  const handleDeleteChat = useCallback(
    async (e: React.MouseEvent, conversationId: string) => {
      e.stopPropagation()
      if (!vaultId) return
      try {
        await deleteConversation(conversationId, vaultId)
        loadConversations()
      } catch (err) {
        console.error('Failed to delete conversation:', err)
      }
    },
    [vaultId, deleteConversation, loadConversations]
  )

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
              <Text
                size={14}
                color="supporting"
                style={{ textAlign: 'center', maxWidth: 300 }}
              >
                {t('vultibot_description')}
              </Text>
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

const IconWrapper = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #33e6bf 0%, #0439c7 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
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
