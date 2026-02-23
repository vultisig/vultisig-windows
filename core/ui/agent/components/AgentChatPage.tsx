import { getVaultId } from '@core/mpc/vault/Vault'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { ErrorBoundary } from '@lib/ui/errors/ErrorBoundary'
import { VStack } from '@lib/ui/layout/Stack'
import { useViewState } from '@lib/ui/navigation/hooks/useViewState'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useAgentEvents } from '../hooks/useAgentEvents'
import { useAgentService } from '../hooks/useAgentService'
import { useConversationStarters } from '../hooks/useConversationStarters'
import { ChatMessage as ChatMessageType, TitleUpdatedEvent } from '../types'
import { AgentErrorFallback } from './AgentErrorFallback'
import { ChatInput } from './ChatInput'
import { ChatMessage } from './ChatMessage'
import { ConfirmationPrompt } from './ConfirmationPrompt'
import { ConnectionButton } from './ConnectionButton'
import { ConversationStarters } from './ConversationStarters'
import { PasswordPrompt } from './PasswordPrompt'
import { ThinkingIndicator } from './ThinkingIndicator'

type AgentChatViewState = { conversationId?: string; initialMessage?: string }

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
  const [chatTitle, setChatTitle] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const initialMessageSentRef = useRef(false)
  const conversationLoadedRef = useRef(false)

  const {
    sendMessage,
    sendMessageToConversation,
    providePassword,
    provideConfirmation,
    cancelRequest,
    getConversation,
    signIn,
    preloadContext,
    orchestrator,
  } = useAgentService()

  const {
    messages,
    isLoading,
    passwordRequired,
    confirmationRequired,
    authRequired,
    error,
    addUserMessage,
    setInitialMessages,
    dismissPasswordRequired,
    dismissConfirmation,
    dismissAuthRequired,
    dismissError,
    requestAuth,
  } = useAgentEvents(conversationId, orchestrator)

  useEffect(() => {
    if (!initialConversationId || conversationLoadedRef.current) return
    const vaultId = vault ? getVaultId(vault) : null
    if (!vaultId) return
    conversationLoadedRef.current = true
    getConversation(initialConversationId, vaultId)
      ?.then(conv => {
        if (conv?.title) {
          setChatTitle(conv.title)
        }
        if (conv?.messages?.length) {
          const mapped: ChatMessageType[] = conv.messages
            .filter(m => m.content_type !== 'action_result')
            .map(m => ({
              id: m.id,
              role: m.role as 'user' | 'assistant',
              content: m.content,
              timestamp: m.created_at,
            }))
          setInitialMessages(mapped)
        }
      })
      ?.catch(() => {})
  }, [initialConversationId, vault, getConversation, setInitialMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const vaultId = vault ? getVaultId(vault) : null

  useEffect(() => {
    if (vaultId) {
      preloadContext(vaultId)
    }
  }, [vaultId, preloadContext])

  const { starters, isLoading: isLoadingStarters } =
    useConversationStarters(vaultId)

  const queuedMessageRef = useRef<string | null>(null)

  const isProcessing = Boolean(isLoading)

  const doSend = async (message: string) => {
    if (!vaultId) return
    addUserMessage(message)
    try {
      if (conversationId) {
        await sendMessageToConversation(conversationId, vaultId, message)
      } else {
        const id = await sendMessage(vaultId, message)
        setConversationId(id)
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err)
      if (errMsg.includes('password required')) {
        pendingMessageRef.current = message
        requestAuth()
        return
      }
      console.error('Failed to send message:', err)
    }
  }

  const handleSend = (message: string) => {
    if (isProcessing) {
      queuedMessageRef.current = message
      addUserMessage(message)
      return
    }
    doSend(message)
  }

  useEffect(() => {
    if (!isProcessing && queuedMessageRef.current) {
      const queued = queuedMessageRef.current
      queuedMessageRef.current = null
      if (!vaultId) return
      if (conversationId) {
        sendMessageToConversation(conversationId, vaultId, queued).catch(err =>
          console.error('Failed to send queued message:', err)
        )
      } else {
        sendMessage(vaultId, queued)
          .then(id => setConversationId(id))
          .catch(err => console.error('Failed to send queued message:', err))
      }
    }
  }, [
    isProcessing,
    vaultId,
    conversationId,
    sendMessage,
    sendMessageToConversation,
  ])

  useEffect(() => {
    if (initialMessage && vaultId && !initialMessageSentRef.current) {
      initialMessageSentRef.current = true
      setViewState(prev => ({ ...prev, initialMessage: undefined }))
      addUserMessage(initialMessage)
      sendMessage(vaultId, initialMessage)
        .then(id => setConversationId(id))
        .catch(err => console.error('Failed to send initial message:', err))
    }
  }, [initialMessage, vaultId, addUserMessage, sendMessage, setViewState])

  useEffect(() => {
    if (!orchestrator) return

    return orchestrator.events.on(
      'title_updated',
      (data: TitleUpdatedEvent) => {
        if (conversationId && data.conversationId === conversationId) {
          setChatTitle(data.title)
        }
      }
    )
  }, [conversationId, orchestrator])

  const handlePasswordSubmit = async (password: string) => {
    dismissPasswordRequired()
    await providePassword(password)
  }

  const handlePasswordCancel = () => {
    dismissPasswordRequired()
    cancelRequest()
  }

  const handleConfirmationConfirm = async () => {
    dismissConfirmation()
    await provideConfirmation(true)
  }

  const handleConfirmationCancel = () => {
    dismissConfirmation()
    provideConfirmation(false)
  }

  const pendingMessageRef = useRef<string | null>(null)
  const [authSignInError, setAuthSignInError] = useState<string | null>(null)
  const [authSigningIn, setAuthSigningIn] = useState(false)

  const handleAuthSignIn = async (password: string) => {
    if (!vaultId) return
    setAuthSignInError(null)
    setAuthSigningIn(true)
    try {
      await signIn(vaultId, password)
      dismissAuthRequired()
      setAuthSigningIn(false)
      const pending = pendingMessageRef.current
      pendingMessageRef.current = null
      if (pending) {
        try {
          if (conversationId) {
            await sendMessageToConversation(conversationId, vaultId, pending)
          } else {
            const id = await sendMessage(vaultId, pending)
            setConversationId(id)
          }
        } catch (err) {
          console.error('Failed to send pending message:', err)
        }
      }
    } catch (err) {
      setAuthSigningIn(false)
      const message =
        err instanceof Error
          ? err.message
          : typeof err === 'string'
            ? err
            : t('agent_sign_in_failed')
      setAuthSignInError(message)
    }
  }

  const handleAuthCancel = () => {
    dismissAuthRequired()
    setAuthSignInError(null)
    setAuthSigningIn(false)
    pendingMessageRef.current = null
  }

  useEffect(() => {
    if (authRequired && messages.length > 0) {
      const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')
      if (lastUserMsg) {
        pendingMessageRef.current = lastUserMsg.content
      }
    }
  }, [authRequired, messages])

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={
          <PageHeaderBackButton onClick={() => navigate({ id: 'agent' })} />
        }
        title={chatTitle || t('vultibot')}
        hasBorder
        secondaryControls={<ConnectionButton />}
      />
      <MessagesContainer>
        <ErrorBoundary fallback={AgentErrorFallback}>
          {messages.length === 0 && !isLoading && (
            <WelcomeMessage>
              <VStack gap={16} alignItems="center">
                <Text size={24} weight={600}>
                  {t('vultibot_welcome')}
                </Text>
                <CenteredText size={14} color="supporting">
                  {t('vultibot_description')}
                </CenteredText>
                <ConversationStarters
                  starters={starters}
                  isLoading={isLoadingStarters}
                  onSelect={handleSend}
                />
              </VStack>
            </WelcomeMessage>
          )}
          {messages.map(msg => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isLoading && <ThinkingIndicator />}
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
      {authRequired && (
        <PasswordPrompt
          toolName="sign_in"
          operation={t('agent_operation_sign_in')}
          description={t('agent_session_expired')}
          error={authSignInError}
          isLoading={authSigningIn}
          onSubmit={handleAuthSignIn}
          onCancel={handleAuthCancel}
        />
      )}
    </VStack>
  )
}

const CenteredText = styled(Text)`
  text-align: center;
`

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
