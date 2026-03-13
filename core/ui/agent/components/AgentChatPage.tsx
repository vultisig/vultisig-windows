import { getVaultId } from '@core/mpc/vault/Vault'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { hideScrollbars } from '@lib/ui/css/hideScrollbars'
import { ErrorBoundary } from '@lib/ui/errors/ErrorBoundary'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { useViewState } from '@lib/ui/navigation/hooks/useViewState'
import { PageContent } from '@lib/ui/page/PageContent'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC, Fragment, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useAgentEvents } from '../hooks/useAgentEvents'
import { useAgentService } from '../hooks/useAgentService'
import { useConnectionStatus } from '../hooks/useConnectionStatus'
import { BurgerClosedIcon } from '../icons/BurgerClosedIcon'
import { ChatMessage as ChatMessageType, TitleUpdatedEvent } from '../types'
import { getDateSections } from '../utils/getDateSections'
import { AgentAuthorizationView } from './AgentAuthorizationView'
import { AgentChatFooter } from './AgentChatFooter'
import { AgentChatMenu } from './AgentChatMenu'
import { AgentEmptyState } from './AgentEmptyState'
import { AgentErrorFallback } from './AgentErrorFallback'
import { AgentHeaderButton } from './AgentHeaderButton'
import { AgentReplyMessage } from './AgentReplyMessage'
import { ChatMessage } from './ChatMessage'
import { ConfirmationPrompt } from './ConfirmationPrompt'
import { PasswordPrompt } from './PasswordPrompt'
import { ReauthorizeAgentDialog } from './ReauthorizeAgentDialog'

type AgentChatViewState = { conversationId?: string; initialMessage?: string }

export const AgentChatPage: FC = () => {
  const { t, i18n } = useTranslation()
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
    isRequestActive,
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
      ?.catch(() => {
        // conversation may have been deleted or user lacks access
      })
  }, [initialConversationId, vault, getConversation, setInitialMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const vaultId = vault ? getVaultId(vault) : null

  const {
    state: connectionState,
    checked: connectionChecked,
    connect: connectionConnect,
    error: connectionError,
    clearError: clearConnectionError,
  } = useConnectionStatus(vaultId, orchestrator)

  const [showConnectionGate, setShowConnectionGate] = useState(false)

  useEffect(() => {
    if (connectionChecked && connectionState === 'disconnected') {
      setShowConnectionGate(true)
    } else if (connectionState === 'connected') {
      setShowConnectionGate(false)
    }
  }, [connectionChecked, connectionState])

  const handleConnectionGateSubmit = async (password: string) => {
    try {
      await connectionConnect(password)
      setShowConnectionGate(false)
    } catch {
      // error is surfaced via connectionError
    }
  }

  const handleConnectionGateCancel = () => {
    setShowConnectionGate(false)
    clearConnectionError()
    navigate({ id: 'vault' })
  }

  useEffect(() => {
    if (vaultId) {
      preloadContext(vaultId)
    }
  }, [vaultId, preloadContext])

  const queuedMessageRef = useRef<string | null>(null)
  const lastSubmittedMessageRef = useRef<string | null>(null)

  const isProcessing = isRequestActive

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
      // error events are surfaced via useAgentEvents
    }
  }

  const handleSessionDeleted = () => {
    navigate({ id: 'agentChat', state: {} })
  }

  const handleSend = (message: string) => {
    if (isProcessing) {
      queuedMessageRef.current = message
      addUserMessage(message)
      return
    }
    lastSubmittedMessageRef.current = message
    doSend(message)
  }

  const handleStop = () => {
    const last = lastSubmittedMessageRef.current
    cancelRequest()
    queuedMessageRef.current = null
    if (last != null) {
      setInputValue(last)
    }
  }

  useEffect(() => {
    if (!isProcessing && queuedMessageRef.current) {
      const queued = queuedMessageRef.current
      queuedMessageRef.current = null
      if (!vaultId) return
      if (conversationId) {
        sendMessageToConversation(conversationId, vaultId, queued).catch(
          () => {}
        )
      } else {
        sendMessage(vaultId, queued)
          .then(id => setConversationId(id))
          .catch(() => {})
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
      lastSubmittedMessageRef.current = initialMessage
      addUserMessage(initialMessage)
      sendMessage(vaultId, initialMessage)
        .then(id => setConversationId(id))
        .catch(() => {})
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

  const handleConfirmationConfirm = async () => {
    dismissConfirmation()
    await provideConfirmation(true)
  }

  const handleConfirmationCancel = () => {
    dismissConfirmation()
    provideConfirmation(false)
  }

  const pendingMessageRef = useRef<string | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [authSignInError, setAuthSignInError] = useState<string | null>(null)
  const [authSigningIn, setAuthSigningIn] = useState(false)

  const [passwordMode, setPasswordMode] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordValue, setPasswordValue] = useState('')
  const passwordSubmittedRef = useRef(false)
  const messagesAtSubmitRef = useRef(0)

  useEffect(() => {
    if (passwordRequired) {
      setPasswordMode(true)
      setPasswordError(null)
      setPasswordValue('')
      passwordSubmittedRef.current = false
      dismissPasswordRequired()
    }
  }, [passwordRequired, dismissPasswordRequired])

  useEffect(() => {
    if (error && passwordMode) {
      setPasswordError(error)
      dismissError()
    }
  }, [error, passwordMode, dismissError])

  useEffect(() => {
    if (
      passwordMode &&
      passwordSubmittedRef.current &&
      messages.length > messagesAtSubmitRef.current
    ) {
      setPasswordMode(false)
      setPasswordValue('')
      setPasswordError(null)
      passwordSubmittedRef.current = false
    }
  }, [passwordMode, messages.length])

  const handleFooterPasswordSubmit = () => {
    if (!passwordValue) return
    setPasswordError(null)
    passwordSubmittedRef.current = true
    messagesAtSubmitRef.current = messages.length
    providePassword(passwordValue)
  }

  const handleFooterPasswordCancel = () => {
    setPasswordMode(false)
    setPasswordError(null)
    setPasswordValue('')
    passwordSubmittedRef.current = false
    cancelRequest()
  }

  const handleReauthorize = async () => {
    if (!vaultId || !orchestrator) return
    await orchestrator.reauthorize(vaultId)
    dismissAuthRequired()
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
      } catch {
        // error events are surfaced via useAgentEvents
      }
    }
  }

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
        } catch {
          // error events are surfaced via useAgentEvents
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

  const indexedMessages = messages.map((message, index) => ({ message, index }))

  const { sections: messageSections, showLabels: showDateSections } =
    getDateSections({
      items: indexedMessages,
      getTimestamp: ({ message }) => message.timestamp,
      labels: {
        today: t('today'),
        yesterday: t('yesterday'),
        locale: i18n.language,
      },
    })

  const hasCachedPassword =
    vaultId != null && orchestrator?.hasCachedPassword(vaultId)

  if (showConnectionGate) {
    return (
      <VStack fullHeight>
        <PageHeader
          hasBorder
          secondaryControls={
            <AgentChatMenu
              conversationId={null}
              onSessionDeleted={handleSessionDeleted}
            />
          }
        />
        <AgentAuthorizationView
          onSubmit={handleConnectionGateSubmit}
          onCancel={handleConnectionGateCancel}
          error={connectionError}
          isLoading={connectionState === 'connecting'}
        />
      </VStack>
    )
  }

  return (
    <VStack fullHeight>
      <AgentChatHeader>
        <AgentChatHeaderRow>
          <AgentChatHeaderSide>
            <AgentHeaderButton onClick={() => navigate({ id: 'agent' })}>
              <BurgerClosedIcon />
            </AgentHeaderButton>
          </AgentChatHeaderSide>
          <AgentChatHeaderTitle variant="bodyM" color="contrast" cropped>
            {chatTitle || t('vultibot')}
          </AgentChatHeaderTitle>
          <AgentChatHeaderSide>
            <AgentChatMenu
              conversationId={conversationId}
              onSessionDeleted={handleSessionDeleted}
            />
          </AgentChatHeaderSide>
        </AgentChatHeaderRow>
      </AgentChatHeader>
      <MessagesContainer>
        <ErrorBoundary fallback={AgentErrorFallback}>
          {messages.length === 0 && !isLoading && (
            <AgentEmptyState onSelect={handleSend} />
          )}
          {(() => {
            const lastAssistantIdx = messages.reduce(
              (last, m, idx) =>
                m.role === 'assistant' &&
                (m.content.trim().length > 0 || m.steps !== undefined)
                  ? idx
                  : last,
              -1
            )
            return messageSections.map(section => (
              <Fragment key={section.key}>
                {showDateSections && (
                  <DateSectionLabel>
                    <Text variant="caption" color="contrast">
                      {section.label}
                    </Text>
                  </DateSectionLabel>
                )}
                {section.items.map(({ message, index }) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isAnalyzing={
                      index === lastAssistantIdx &&
                      !message.analysisDuration &&
                      isRequestActive
                    }
                  />
                ))}
              </Fragment>
            ))
          })()}
          {isLoading && !messages.some(m => m.steps !== undefined) && (
            <AgentReplyMessage isAnalyzing content="" />
          )}
          {error && !passwordMode && (
            <ErrorMessage onClick={dismissError}>
              <Text size={14} color="danger">
                {error}
              </Text>
            </ErrorMessage>
          )}
        </ErrorBoundary>
        <div ref={messagesEndRef} />
      </MessagesContainer>
      {passwordMode ? (
        <AgentChatFooter
          mode="password"
          value={passwordValue}
          onChange={setPasswordValue}
          onSubmit={handleFooterPasswordSubmit}
          onCancel={handleFooterPasswordCancel}
          error={passwordError}
        />
      ) : (
        <AgentChatFooter
          mode="chat"
          value={inputValue}
          onChange={setInputValue}
          onSubmit={() => {
            const trimmed = inputValue.trim()
            if (trimmed) {
              handleSend(trimmed)
              setInputValue('')
            }
          }}
          placeholder={t('ask_about_plugins_policies')}
          isLoading={isProcessing}
          onStop={handleStop}
          onWalletClick={() => navigate({ id: 'vault' })}
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
      {authRequired && hasCachedPassword && (
        <ReauthorizeAgentDialog
          onAuthorize={handleReauthorize}
          onCancel={handleAuthCancel}
        />
      )}
      {authRequired && !hasCachedPassword && (
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

/** Matches Figma Agent Header (68514:113082). Used so messages scroll *under* the header for glass effect. */
const agentChatHeaderHeightPx = 56

const AgentChatHeader = styled.header`
  position: sticky;
  top: 0;
  /* Above scroll content (and any z-index inside it, e.g. orb) so nothing overlays the header. */
  z-index: 10;
  display: flex;
  align-items: center;
  min-height: ${agentChatHeaderHeightPx}px;
  padding: 12px 16px;
  /* Figma: backgrounds/disabled rgba(11,26,58,0.5) — slightly lower opacity so content behind is barely visible (heavy glass) */
  background: rgba(11, 26, 58, 0.42);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid ${getColor('foregroundExtra')};
`

const AgentChatHeaderRow = styled(HStack)`
  flex: 1;
  min-width: 0;
  gap: 14px;
  align-items: center;
`

const AgentChatHeaderSide = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
`

const AgentChatHeaderTitle = styled(Text)`
  flex: 1;
  min-width: 0;
`

/* Scroll area extends under the sticky header so content passes behind it; backdrop-filter can then blur that content (glass effect). */
/* z-index: 0 so the header (z-index: 10) always paints on top and nothing in messages (e.g. orb) overlays it. */
const MessagesContainer = styled(PageContent)`
  flex: 1;
  min-height: 0;
  position: relative;
  z-index: 0;
  overflow-y: auto;
  margin-top: -${agentChatHeaderHeightPx}px;
  padding: ${agentChatHeaderHeightPx}px 16px 16px;
  ${hideScrollbars};
`

const ErrorMessage = styled.div`
  padding: 12px 16px;
  background: ${getColor('danger')}20;
  border-radius: 8px;
  cursor: pointer;
`

const DateSectionLabel = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`
