import { getVaultId } from '@core/mpc/vault/Vault'
import { BottomNavigation } from '@core/ui/vault/components/BottomNavigation'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Button } from '@lib/ui/buttons/Button'
import { Center } from '@lib/ui/layout/Center'
import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Text } from '@lib/ui/text'
import { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { useCoreNavigate } from '../navigation/hooks/useCoreNavigate'
import { ChatHeader } from './components/ChatHeader'
import { ChatInput } from './components/ChatInput'
import { ChatLoader } from './components/ChatLoader'
import { ChatMessage } from './components/ChatMessage'
import { ConversationList } from './components/ConversationList'
import { InstallPrompt } from './components/InstallPrompt'
import { PolicyReview } from './components/PolicyReview'
import { SuggestionCards } from './components/SuggestionCard'
import { useAuth } from './hooks/useAuth'
import { useConversation } from './hooks/useConversation'
import { encodePolicy } from './policy/policyEncoder'

export const ChatPage = () => {
  const vault = useCurrentVault()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showHistory, setShowHistory] = useState(false)
  const navigate = useCoreNavigate()

  const publicKey = vault ? getVaultId(vault) : ''
  const { accessToken, needsAuth, isLoading: isAuthLoading } = useAuth()

  const {
    conversationId,
    messages,
    suggestions,
    installRequired,
    policyReady,
    isLoading,
    error,
    sendMessage,
    selectSuggestion,
    reportActionResult,
    startNewConversation,
    clearState,
    switchConversation,
    deleteConversation,
    conversations,
    isConversationLoading,
  } = useConversation({
    publicKey,
    accessToken,
  })

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = useCallback(
    (content: string) => {
      sendMessage(content)
    },
    [sendMessage]
  )

  const handleInstall = useCallback(() => {
    if (!installRequired) return
    navigate({
      id: 'chatPluginInstall',
      state: { pluginId: installRequired.plugin_id },
    })
  }, [installRequired, navigate])

  const handleCreatePolicy = useCallback(() => {
    if (!policyReady) return

    try {
      const { recipe, signingMessage, policyId } = encodePolicy({
        policySuggest: policyReady.policy_suggest,
        configuration: policyReady.configuration,
        publicKey,
        pluginId: policyReady.plugin_id,
      })

      navigate({
        id: 'chatPolicySign',
        state: {
          pluginId: policyReady.plugin_id,
          recipe,
          signingMessage,
          policyId,
          publicKey,
          policyVersion: 1,
          pluginVersion: 1,
          accessToken,
        },
      })
    } catch (err) {
      reportActionResult({
        action: 'create_policy',
        success: false,
        error: err instanceof Error ? err.message : 'Failed to encode policy',
      })
    }
  }, [policyReady, publicKey, accessToken, navigate, reportActionResult])

  // Handle action results returned from chatPolicySign/chatPluginInstall pages
  useEffect(() => {
    if (!conversationId) return

    const handlePendingAction = async () => {
      const pendingResult = sessionStorage.getItem('chat_pending_action')
      if (pendingResult) {
        sessionStorage.removeItem('chat_pending_action')
        try {
          const result = JSON.parse(pendingResult)
          await reportActionResult(result)
        } catch {
          // Ignore parse errors
        }
      }
    }
    handlePendingAction()
  }, [conversationId, reportActionResult])

  if (!vault) {
    return (
      <Wrapper flexGrow>
        <Center>
          <Text color="shy">No vault selected</Text>
        </Center>
        <BottomNavigation activeTab="chat" />
      </Wrapper>
    )
  }

  if (isAuthLoading) {
    return (
      <Wrapper flexGrow>
        <Center>
          <Spinner />
        </Center>
        <BottomNavigation activeTab="chat" />
      </Wrapper>
    )
  }

  if (needsAuth) {
    return (
      <Wrapper flexGrow>
        <VStack flexGrow fullWidth>
          <ChatHeader
            onNewConversation={startNewConversation}
            onShowHistory={() => setShowHistory(true)}
          />
          <VStack
            alignItems="center"
            justifyContent="center"
            flexGrow
            gap={16}
            padding={32}
          >
            <Text size={16} weight={500} color="contrast">
              Authentication Required
            </Text>
            <Text size={14} color="shy" centerHorizontally>
              Sign a message to verify vault ownership and enable chat features.
            </Text>
            <Button onClick={() => navigate({ id: 'chatAuth' })}>
              Authenticate
            </Button>
          </VStack>
        </VStack>
        <BottomNavigation activeTab="chat" />
      </Wrapper>
    )
  }

  return (
    <Wrapper flexGrow>
      <ChatHeader
        onNewConversation={startNewConversation}
        onShowHistory={() => setShowHistory(true)}
      />

      <MessagesContainer>
        {isConversationLoading ? (
          <Center>
            <Spinner />
          </Center>
        ) : messages.length === 0 ? (
          <WelcomeContainer
            alignItems="center"
            justifyContent="center"
            flexGrow
          >
            <VStack gap={8} alignItems="center">
              <Text size={16} weight={500} color="contrast">
                Welcome to Vultisig Chat
              </Text>
              <Text size={14} color="shy" centerHorizontally>
                Ask me about DCA, swaps, or managing your crypto
              </Text>
            </VStack>
          </WelcomeContainer>
        ) : (
          <VStack gap={8} padding={16}>
            {messages
              .filter(m => m.content_type !== 'action_result')
              .map(message => (
                <ChatMessage key={message.id} message={message} />
              ))}

            {isLoading && <ChatLoader />}

            {suggestions.length > 0 && !isLoading && (
              <SuggestionCards
                suggestions={suggestions}
                onSelect={selectSuggestion}
                disabled={isLoading}
              />
            )}

            {installRequired && !isLoading && (
              <InstallPrompt
                installRequired={installRequired}
                onInstall={handleInstall}
                onCancel={clearState}
              />
            )}

            {policyReady && !isLoading && (
              <PolicyReview
                policyReady={policyReady}
                onCreate={handleCreatePolicy}
                onCancel={clearState}
              />
            )}

            <div ref={messagesEndRef} />
          </VStack>
        )}

        {error && (
          <ErrorBanner>
            <Text size={12} color="danger">
              {error}
            </Text>
          </ErrorBanner>
        )}
      </MessagesContainer>

      <ChatInput onSend={handleSend} disabled={isLoading} />
      <BottomNavigation activeTab="chat" />

      {showHistory && (
        <ConversationList
          conversations={conversations}
          activeConversationId={conversationId}
          onSelect={id => {
            switchConversation(id)
            setShowHistory(false)
          }}
          onDelete={deleteConversation}
          onClose={() => setShowHistory(false)}
        />
      )}
    </Wrapper>
  )
}

const Wrapper = styled(VStack)`
  position: relative;
  height: 100%;
  padding-bottom: var(--page-bottom-inset, 66px);
`

const MessagesContainer = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`

const WelcomeContainer = styled(VStack)`
  padding: 32px 16px;
`

const ErrorBanner = styled.div`
  padding: 8px 16px;
  background: ${({ theme }) =>
    theme.colors.danger.getVariant({ a: () => 0.15 }).toCssValue()};
`
