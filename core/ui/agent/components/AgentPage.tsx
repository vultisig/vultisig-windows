import { getVaultId } from '@core/mpc/vault/Vault'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { BottomNavigation } from '@core/ui/vault/components/BottomNavigation'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { PlusIcon } from '@lib/ui/icons/PlusIcon'
import { TrashIcon } from '@lib/ui/icons/TrashIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { attempt } from '@lib/utils/attempt'
import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useAgentService } from '../hooks/useAgentService'
import { Conversation } from '../types'
import { AgentChatInput } from './AgentChatInput'
import { AgentEmptyState } from './AgentEmptyState'
import { ConnectionButton } from './ConnectionButton'

export const AgentPage: FC = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const vault = useCurrentVault()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [refreshKey, setRefreshKey] = useState(0)
  const [inputValue, setInputValue] = useState('')

  const { getConversations, deleteConversation } = useAgentService()

  const vaultId = vault ? getVaultId(vault) : null

  useEffect(() => {
    if (!vaultId) return
    getConversations(vaultId)
      .then(convs => setConversations(convs || []))
      .catch(() => {})
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
    const result = await attempt(() =>
      deleteConversation(conversationId, vaultId)
    )
    if ('error' in result) return
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
          <AgentEmptyState onSelect={starter => handleNewChat(starter)} />
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
      <ChatInputContainer>
        <AgentChatInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={() => {
            const trimmed = inputValue.trim()
            if (trimmed) {
              handleNewChat(trimmed)
              setInputValue('')
            }
          }}
          placeholder={t('ask_about_plugins_policies')}
        />
      </ChatInputContainer>
      <BottomNavigation activeTab="agent" />
    </VStack>
  )
}

const ChatInputContainer = styled.div`
  padding: 12px 16px calc(12px + var(--page-bottom-inset, 0px));
`

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
