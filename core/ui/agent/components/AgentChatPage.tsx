import { Chain } from '@core/chain/Chain'
import { getVaultId } from '@core/mpc/vault/Vault'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { VStack } from '@lib/ui/layout/Stack'
import { useViewState } from '@lib/ui/navigation/hooks/useViewState'

type AgentChatViewState = { conversationId?: string; initialMessage?: string }
import { ErrorBoundary } from '@lib/ui/errors/ErrorBoundary'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useAgentEvents } from '../hooks/useAgentEvents'
import { useAgentService } from '../hooks/useAgentService'
import { useConversationStarters } from '../hooks/useConversationStarters'
import { generateChatTitle } from '../utils/generateChatTitle'
import { ChatInput } from './ChatInput'
import { ChatMessage } from './ChatMessage'
import { ConfirmationPrompt } from './ConfirmationPrompt'
import { ConversationStarters } from './ConversationStarters'
import { PasswordPrompt } from './PasswordPrompt'
import { StreamingText } from './StreamingText'
import { ThinkingIndicator } from './ThinkingIndicator'

export const AgentChatPage: FC = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const vault = useCurrentVault()
  const [viewState, setViewState] = useViewState<
    AgentChatViewState | undefined
  >()
  const initialConversationId = viewState?.conversationId
  const initialMessage = viewState?.initialMessage
  const [conversationId, setConversationId] = useState<string | null>(
    initialConversationId ?? null
  )
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const initialMessageSentRef = useRef(false)

  const {
    sendMessage,
    providePassword,
    provideConfirmation,
    cancelRequest,
    checkApiKey,
    updateConversationName,
    isLoading,
  } = useAgentService()

  const hasNamedConversationRef = useRef(false)

  const {
    messages,
    isThinking,
    streamingSegments,
    toolResults,
    passwordRequired,
    confirmationRequired,
    error,
    addUserMessage,
    setInitialMessages,
    dismissPasswordRequired,
    dismissConfirmation,
    dismissError,
  } = useAgentEvents(conversationId)

  useEffect(() => {
    checkApiKey().then(setHasApiKey)
  }, [checkApiKey])

  useEffect(() => {
    if (initialConversationId) {
      window.go?.agent?.AgentService?.GetConversation(initialConversationId)
        ?.then(conv => {
          if (conv?.messages?.length) {
            setInitialMessages(conv.messages)
          }
        })
        ?.catch(() => {})
    }
  }, [initialConversationId, setInitialMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingSegments, isThinking])

  const vaultId = vault ? getVaultId(vault) : null
  const { starters, isLoading: isLoadingStarters } =
    useConversationStarters(vaultId)

  const handleSend = useCallback(
    async (message: string) => {
      if (!vaultId) return

      addUserMessage(message)

      try {
        const id = await sendMessage(vaultId, message)
        setConversationId(id)
      } catch (err) {
        console.error('Failed to send message:', err)
      }
    },
    [vaultId, addUserMessage, sendMessage]
  )

  useEffect(() => {
    if (initialMessage && vaultId && !initialMessageSentRef.current) {
      initialMessageSentRef.current = true
      // Clear initialMessage from viewState to prevent re-sending when navigating back
      setViewState(prev => ({ ...prev, initialMessage: undefined }))
      addUserMessage(initialMessage)
      sendMessage(vaultId, initialMessage)
        .then(id => setConversationId(id))
        .catch(err => console.error('Failed to send initial message:', err))
    }
  }, [initialMessage, vaultId, addUserMessage, sendMessage, setViewState])

  useEffect(() => {
    if (
      conversationId &&
      messages.length >= 1 &&
      !hasNamedConversationRef.current
    ) {
      const firstUserMessage = messages.find(m => m.role === 'user')
      if (firstUserMessage) {
        hasNamedConversationRef.current = true
        const title = generateChatTitle(firstUserMessage.content)
        updateConversationName(conversationId, title).catch(err =>
          console.error('Failed to update conversation name:', err)
        )
      }
    }
  }, [conversationId, messages, updateConversationName])

  useEffect(() => {
    if (!window.runtime) return

    type NavigateEvent = {
      id: string
      state?: Record<string, unknown>
    }

    const handleNavigate = (data: NavigateEvent) => {
      if (data.id === 'swap') {
        const state = data.state || {}
        const fromCoin = state.fromCoin as
          | { chain: string; id?: string }
          | undefined
        const toCoin = state.toCoin as
          | { chain: string; id?: string }
          | undefined

        const buildCoinKey = (coin: { chain: string; id?: string }) => {
          const result: { chain: Chain; id?: string } = {
            chain: coin.chain as Chain,
          }
          if (coin.id) {
            result.id = coin.id
          }
          return result
        }

        navigate({
          id: 'swap',
          state: {
            fromCoin: fromCoin ? buildCoinKey(fromCoin) : undefined,
            toCoin: toCoin ? buildCoinKey(toCoin) : undefined,
          },
        })
      } else if (data.id === 'send') {
        const state = data.state || {}
        const coin = state.coin as { chain: string; id?: string } | undefined
        if (coin) {
          const coinKey: { chain: Chain; id?: string } = {
            chain: coin.chain as Chain,
          }
          if (coin.id) {
            coinKey.id = coin.id
          }
          navigate({
            id: 'send',
            state: {
              coin: coinKey,
              address: state.address as string | undefined,
              memo: state.memo as string | undefined,
            },
          })
        }
      }
    }

    const cleanup = window.runtime.EventsOn(
      'agent:navigate',
      handleNavigate as (data: unknown) => void
    )

    return cleanup
  }, [navigate])

  const handlePasswordSubmit = useCallback(
    async (password: string) => {
      dismissPasswordRequired()
      await providePassword(password)
    },
    [dismissPasswordRequired, providePassword]
  )

  const handlePasswordCancel = useCallback(() => {
    dismissPasswordRequired()
    cancelRequest()
  }, [dismissPasswordRequired, cancelRequest])

  const handleConfirmationConfirm = useCallback(async () => {
    dismissConfirmation()
    await provideConfirmation(true)
  }, [dismissConfirmation, provideConfirmation])

  const handleConfirmationCancel = useCallback(() => {
    dismissConfirmation()
    provideConfirmation(false)
  }, [dismissConfirmation, provideConfirmation])

  const handleStop = useCallback(() => {
    cancelRequest().catch(err => {
      console.error('Failed to cancel request:', err)
    })
  }, [cancelRequest])

  const isProcessing = Boolean(
    isThinking || isLoading || streamingSegments.length > 0
  )

  if (hasApiKey === false) {
    return (
      <VStack fullHeight>
        <PageHeader
          primaryControls={
            <PageHeaderBackButton onClick={() => navigate({ id: 'agent' })} />
          }
          title={t('vultibot')}
          hasBorder
        />
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
      </VStack>
    )
  }

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={
          <PageHeaderBackButton onClick={() => navigate({ id: 'agent' })} />
        }
        title={t('vultibot')}
        hasBorder
      />
      <MessagesContainer>
        <ErrorBoundary fallback={AgentErrorFallback}>
          {messages.length === 0 &&
            !isThinking &&
            streamingSegments.length === 0 && (
              <WelcomeMessage>
                <VStack gap={16} alignItems="center">
                  <Text size={24} weight={600}>
                    {t('vultibot_welcome')}
                  </Text>
                  <Text
                    size={14}
                    color="supporting"
                    style={{ textAlign: 'center' }}
                  >
                    {t('vultibot_description')}
                  </Text>
                  <ConversationStarters
                    starters={starters}
                    isLoading={isLoadingStarters}
                    fullWidth={false}
                    onSelect={handleSend}
                  />
                </VStack>
              </WelcomeMessage>
            )}
          {messages.map(msg => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isThinking && streamingSegments.length === 0 && (
            <ThinkingIndicator />
          )}
          <StreamingText
            segments={streamingSegments}
            toolResults={toolResults}
          />
          {error && (
            <ErrorMessage onClick={dismissError}>
              <Text size={14} color="danger">
                {error}
              </Text>
            </ErrorMessage>
          )}
        </ErrorBoundary>
        <div ref={messagesEndRef} />
      </MessagesContainer>
      <ChatInput
        onSend={handleSend}
        onStop={handleStop}
        isRunning={isProcessing}
        placeholder={t('ask_about_plugins_policies')}
      />
      {passwordRequired && (
        <PasswordPrompt
          toolName={passwordRequired.toolName}
          operation={passwordRequired.operation}
          onSubmit={handlePasswordSubmit}
          onCancel={handlePasswordCancel}
        />
      )}
      {confirmationRequired && (
        <ConfirmationPrompt
          action={confirmationRequired.action}
          details={confirmationRequired.details}
          onConfirm={handleConfirmationConfirm}
          onCancel={handleConfirmationCancel}
        />
      )}
    </VStack>
  )
}

const AgentErrorFallback: FC<{ clearError: () => void }> = ({ clearError }) => (
  <VStack gap={12} alignItems="center" style={{ padding: 24 }}>
    <Text size={14} color="danger">
      Something went wrong rendering the chat.
    </Text>
    <Text
      size={13}
      color="primary"
      style={{ cursor: 'pointer' }}
      onClick={clearError}
    >
      Try again
    </Text>
  </VStack>
)

const MessagesContainer = styled(PageContent)`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`

const WelcomeMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 24px;
`

const ErrorMessage = styled.div`
  padding: 12px 16px;
  background: ${getColor('danger')}20;
  border-radius: 8px;
  cursor: pointer;
`

const CodeBlock = styled.div`
  padding: 12px 16px;
  background: ${getColor('foreground')};
  border-radius: 8px;
  font-family: monospace;
`
