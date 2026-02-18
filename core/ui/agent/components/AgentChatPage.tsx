import { getVaultId } from '@core/mpc/vault/Vault'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { ErrorBoundary } from '@lib/ui/errors/ErrorBoundary'
import { VStack } from '@lib/ui/layout/Stack'
import { useViewState } from '@lib/ui/navigation/hooks/useViewState'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useAgentEvents } from '../hooks/useAgentEvents'
import { useAgentService } from '../hooks/useAgentService'
import { useConversationStarters } from '../hooks/useConversationStarters'
import { Action, Suggestion, TitleUpdatedEvent } from '../types'
import { ActionCard } from './ActionCard'
import { ChatInput } from './ChatInput'
import { ChatMessage } from './ChatMessage'
import { ConfirmationPrompt } from './ConfirmationPrompt'
import { ConnectionButton } from './ConnectionButton'
import { ConversationStarters } from './ConversationStarters'
import { PasswordPrompt } from './PasswordPrompt'
import { SuggestionCard } from './SuggestionCard'
import { SwapReviewCard } from './swap-review'
import { ThinkingIndicator } from './ThinkingIndicator'
import { TxStatusCard } from './TxStatusCard'

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

  const {
    sendMessage,
    sendMessageToConversation,
    executeAction,
    selectSuggestion,
    providePassword,
    provideConfirmation,
    cancelRequest,
    getConversation,
    signIn,
    preloadContext,
    isLoading: serviceLoading,
  } = useAgentService()

  const {
    messages,
    isLoading,
    actions,
    suggestions,
    txReady,
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
    dismissTxReady,
    dismissTxStatus,
    requestAuth,
  } = useAgentEvents(conversationId)

  useEffect(() => {
    if (initialConversationId) {
      const vaultId = vault ? getVaultId(vault) : null
      if (!vaultId) return
      getConversation(initialConversationId, vaultId)
        ?.then(conv => {
          if (conv?.title) {
            setChatTitle(conv.title)
          }
          if (conv?.messages?.length) {
            const mapped = conv.messages
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
    }
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

  const isProcessing = useMemo(
    () => Boolean(isLoading || serviceLoading),
    [isLoading, serviceLoading]
  )

  const doSend = useCallback(
    async (message: string) => {
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
    },
    [
      vaultId,
      conversationId,
      addUserMessage,
      sendMessage,
      sendMessageToConversation,
      requestAuth,
    ]
  )

  const handleSend = useCallback(
    (message: string) => {
      if (isProcessing) {
        queuedMessageRef.current = message
        addUserMessage(message)
        return
      }
      doSend(message)
    },
    [isProcessing, addUserMessage, doSend]
  )

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
    if (!window.runtime) return

    const cleanup = window.runtime.EventsOn(
      'agent:title_updated',
      (data: unknown) => {
        const event = data as TitleUpdatedEvent
        if (conversationId && event.conversationId === conversationId) {
          setChatTitle(event.title)
        }
      }
    )

    return cleanup
  }, [conversationId])

  const refetchQueries = useRefetchQueries()

  useEffect(() => {
    if (!window.runtime) return

    const cleanupCoins = window.runtime.EventsOn('vault:coins-changed', () => {
      refetchQueries([StorageKey.vaultsCoins], [StorageKey.vaults])
    })

    const cleanupAddressBook = window.runtime.EventsOn(
      'addressbook:changed',
      () => {
        refetchQueries([StorageKey.addressBookItems])
      }
    )

    return () => {
      cleanupCoins()
      cleanupAddressBook()
    }
  }, [refetchQueries])

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

  const pendingMessageRef = useRef<string | null>(null)
  const [authSignInError, setAuthSignInError] = useState<string | null>(null)
  const [authSigningIn, setAuthSigningIn] = useState(false)

  const handleAuthSignIn = useCallback(
    async (password: string) => {
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
              : 'Sign in failed'
        setAuthSignInError(message)
      }
    },
    [
      vaultId,
      conversationId,
      signIn,
      dismissAuthRequired,
      sendMessage,
      sendMessageToConversation,
    ]
  )

  const handleAuthCancel = useCallback(() => {
    dismissAuthRequired()
    setAuthSignInError(null)
    setAuthSigningIn(false)
    pendingMessageRef.current = null
  }, [dismissAuthRequired])

  useEffect(() => {
    if (authRequired && messages.length > 0) {
      const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')
      if (lastUserMsg) {
        pendingMessageRef.current = lastUserMsg.content
      }
    }
  }, [authRequired, messages])

  const handleActionExecute = useCallback(
    (action: Action) => {
      if (!conversationId || !vaultId) return
      executeAction(conversationId, vaultId, action).catch(err =>
        console.error('Failed to execute action:', err)
      )
    },
    [conversationId, vaultId, executeAction]
  )

  const handleSwapCancel = useCallback(() => {
    dismissTxReady()
    doSend('I cancelled the swap transaction.')
  }, [dismissTxReady, doSend])

  const handleSuggestionSelect = useCallback(
    (suggestion: Suggestion) => {
      if (!conversationId || !vaultId) return
      selectSuggestion(conversationId, vaultId, suggestion.id).catch(err =>
        console.error('Failed to select suggestion:', err)
      )
    },
    [conversationId, vaultId, selectSuggestion]
  )

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
                  onSelect={handleSend}
                />
              </VStack>
            </WelcomeMessage>
          )}
          {messages.map(msg =>
            msg.txStatus ? (
              <div
                key={msg.id}
                style={{
                  padding: '8px 0',
                  maxWidth: '85%',
                  marginLeft: 44,
                }}
              >
                <TxStatusCard
                  txStatus={msg.txStatus}
                  onDismiss={() => dismissTxStatus(msg.txStatus!.txHash)}
                />
              </div>
            ) : (
              <ChatMessage key={msg.id} message={msg} />
            )
          )}
          {isLoading && <ThinkingIndicator />}
          {actions.length > 0 && (
            <VStack gap={8} style={{ padding: '8px 0' }}>
              {actions.map(action => (
                <ActionCard
                  key={action.id}
                  action={action}
                  onExecute={handleActionExecute}
                />
              ))}
            </VStack>
          )}
          {suggestions.length > 0 && (
            <VStack gap={8} style={{ padding: '8px 0' }}>
              {suggestions.map(suggestion => (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onSelect={handleSuggestionSelect}
                />
              ))}
            </VStack>
          )}
          {txReady && (
            <div style={{ padding: '8px 0' }}>
              <SwapReviewCard
                txReady={txReady}
                onSign={handleActionExecute}
                onCancel={handleSwapCancel}
              />
            </div>
          )}
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
          operation="sign in"
          description="Your session has expired. Enter your vault password to reconnect."
          error={authSignInError}
          isLoading={authSigningIn}
          onSubmit={handleAuthSignIn}
          onCancel={handleAuthCancel}
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
