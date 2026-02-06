import { getVaultId } from '@core/mpc/vault/Vault'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { BottomNavigation } from '@core/ui/vault/components/BottomNavigation'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { CheckIcon } from '@lib/ui/icons/CheckIcon'
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

import { useConversationStarters } from '../hooks/useConversationStarters'
import { useAgentService } from '../hooks/useAgentService'
import { Conversation } from '../types'
import { ChatInput } from './ChatInput'
import { ConversationStarters } from './ConversationStarters'
import { PasswordPrompt } from './PasswordPrompt'

export const AgentPage: FC = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const vault = useCurrentVault()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null)
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false)
  const [showSignInPrompt, setShowSignInPrompt] = useState(false)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [signInError, setSignInError] = useState<string | null>(null)

  const { checkApiKey, getVerifierSignInStatus, signIn } = useAgentService()

  const vaultId = vault ? getVaultId(vault) : null
  const { starters } = useConversationStarters(vaultId)

  const loadConversations = useCallback(async () => {
    if (!vaultId) return
    try {
      const convs = await window.go.agent.AgentService.GetConversations(vaultId)
      setConversations(convs || [])
    } catch (err) {
      console.error('Failed to load conversations:', err)
    }
  }, [vaultId])

  const checkSignInStatus = useCallback(async () => {
    if (!vaultId) return
    const status = await getVerifierSignInStatus(vaultId)
    setIsSignedIn(status)
  }, [vaultId, getVerifierSignInStatus])

  useEffect(() => {
    checkApiKey().then(setHasApiKey).catch(() => setHasApiKey(false))
    checkSignInStatus()
    loadConversations()
  }, [checkApiKey, checkSignInStatus, loadConversations])

  const handleSignIn = useCallback(
    async (password: string) => {
      if (!vaultId) return
      setIsSigningIn(true)
      setSignInError(null)
      try {
        await signIn(vaultId, password)
        setShowSignInPrompt(false)
        await checkSignInStatus()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to sign in'
        setSignInError(message)
      } finally {
        setIsSigningIn(false)
      }
    },
    [vaultId, signIn, checkSignInStatus]
  )

  const handleNewChat = useCallback(
    async (initialMessage?: string) => {
      if (!vaultId) return
      try {
        const convId = await window.go.agent.AgentService.NewConversation(
          vaultId,
          'New Chat'
        )
        navigate({
          id: 'agentChat',
          state: { conversationId: convId, initialMessage },
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
      try {
        await window.go.agent.AgentService.DeleteConversation(conversationId)
        loadConversations()
      } catch (err) {
        console.error('Failed to delete conversation:', err)
      }
    },
    [loadConversations]
  )

  if (hasApiKey === false) {
    return (
      <VStack fullHeight>
        <PageHeader title={t('vultibot')} hasBorder />
        <PageContent gap={24} alignItems="center" justifyContent="center">
          <VStack gap={16} alignItems="center">
            <Text size={16} weight={600}>
              {t('api_key_required')}
            </Text>
            <Text size={14} color="supporting" style={{ textAlign: 'center' }}>
              {t('api_key_required_description')}
            </Text>
            <CodeBlock>
              <Text size={12} color="supporting">
                export ANTHROPIC_API_KEY=your_api_key
              </Text>
            </CodeBlock>
          </VStack>
        </PageContent>
        <BottomNavigation activeTab="agent" />
      </VStack>
    )
  }

  return (
    <VStack fullHeight>
      <PageHeader
        title={t('vultibot')}
        hasBorder
        secondaryControls={
          <HStack gap={8} alignItems="center">
            <SignInButton
              onClick={() => setShowSignInPrompt(true)}
              disabled={isSigningIn}
            >
              {isSignedIn ? <CheckIcon /> : null}
              <Text size={12}>{isSignedIn ? 'Signed in' : 'Sign in'}</Text>
            </SignInButton>
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
              <VStack gap={8} style={{ width: '100%', maxWidth: 320 }}>
                <ConversationStarters
                  starters={starters}
                  onSelect={starter => handleNewChat(starter)}
                />
              </VStack>
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
                      {conv.name || t('new_chat')}
                    </Text>
                    <Text size={12} color="supporting">
                      {conv.messages?.length || 0} {t('messages')}
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
        disabled={!hasApiKey}
      />
      {signInError && (
        <SignInErrorBanner>
          <Text size={12} color="danger">
            {signInError}
          </Text>
        </SignInErrorBanner>
      )}
      <BottomNavigation activeTab="agent" />
      {showSignInPrompt && (
        <PasswordPrompt
          toolName="sign_in"
          operation="signing in to verifier"
          onSubmit={handleSignIn}
          onCancel={() => {
            setShowSignInPrompt(false)
            setSignInError(null)
          }}
        />
      )}
    </VStack>
  )
}

const SignInButton = styled(UnstyledButton)`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  background: ${getColor('foreground')};
  color: ${getColor('text')};
  font-size: 12px;

  &:hover {
    background: ${getColor('foregroundExtra')};
  }
`

const SignInErrorBanner = styled.div`
  margin: 0 16px 8px;
  padding: 8px 12px;
  border-radius: 8px;
  background: ${getColor('danger')}20;
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

const ConversationItem = styled(UnstyledButton)`
  width: 100%;
  padding: 16px;
  border-radius: 12px;
  background: ${getColor('foreground')};
  text-align: left;

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

const CodeBlock = styled.div`
  padding: 12px 16px;
  background: ${getColor('foreground')};
  border-radius: 8px;
  font-family: monospace;
`
