import { create } from '@bufbuild/protobuf'
import { StartKeysignView } from '@core/extension/keysign/start/StartKeysignView'
import { KeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import { CustomMessagePayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/custom_message_payload_pb'
import { getVaultId } from '@core/mpc/vault/Vault'
import { FlowPageHeader } from '@core/ui/flow/FlowPageHeader'
import {
  KeysignMutationListener,
  KeysignMutationListenerProvider,
} from '@core/ui/mpc/keysign/action/state/keysignMutationListener'
import { StartKeysignPrompt } from '@core/ui/mpc/keysign/prompt/StartKeysignPrompt'
import { CoreView } from '@core/ui/navigation/CoreView'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { ActiveView } from '@lib/ui/navigation/ActiveView'
import { useNavigate } from '@lib/ui/navigation/hooks/useNavigate'
import { NavigationProvider } from '@lib/ui/navigation/state'
import { Views } from '@lib/ui/navigation/Views'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { Text } from '@lib/ui/text'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { useQueryClient } from '@tanstack/react-query'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

import { verifierUrl } from '../state/chatConfig'
import { toEip191Hex, toHex } from '../utils/toEip191Hex'
import { setChatAuthToken } from './chatAuthStorage'

type ChatAuthView = { id: 'overview' } | Extract<CoreView, { id: 'keysign' }>

const views: Views<ChatAuthView['id']> = {
  keysign: StartKeysignView,
  overview: AuthOverview,
}

export const ChatAuthPage = () => {
  // coreNavigate must be called HERE — above the local NavigationProvider —
  // so it uses the app-level navigation context, not the local one.
  const coreNavigate = useCoreNavigate()

  const onNavigateToChat = useCallback(() => {
    coreNavigate({ id: 'chat' })
  }, [coreNavigate])

  return (
    <NavigationProvider initialValue={{ history: [{ id: 'overview' }] }}>
      <ChatAuthNavigationWrapper onNavigateToChat={onNavigateToChat} />
    </NavigationProvider>
  )
}

const getAuthMessage = () => {
  const randomBuf = new Uint8Array(16)
  crypto.getRandomValues(randomBuf)
  const nonce = toHex(randomBuf)
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()
  return JSON.stringify({
    message: 'Vultisig Chat Login',
    nonce,
    expiresAt,
  })
}

type ChatAuthNavigationWrapperProps = {
  onNavigateToChat: () => void
}

const ChatAuthNavigationWrapper = ({
  onNavigateToChat,
}: ChatAuthNavigationWrapperProps) => {
  const navigate = useNavigate<ChatAuthView>()
  const vault = useCurrentVault()
  const publicKey = vault ? getVaultId(vault) : ''
  const chainCodeHex = vault?.hexChainCode ?? ''
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const [isPosting, setIsPosting] = useState(false)
  const [currentAuthMessage] = useState(getAuthMessage)

  const keysignMutationListener: KeysignMutationListener = useMemo(
    () => ({
      onSuccess: async result => {
        const signature = getRecordUnionValue(result, 'signature')
        setIsPosting(true)
        setError(null)
        try {
          const response = await fetch(`${verifierUrl}/auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              public_key: publicKey,
              message: currentAuthMessage,
              signature: signature.startsWith('0x')
                ? signature
                : `0x${signature}`,
              chain_code_hex: chainCodeHex,
            }),
          })
          if (!response.ok) {
            const errorBody = await response.json().catch(() => null)
            const errorMsg =
              errorBody?.error?.message || `Auth failed: ${response.status}`
            throw new Error(errorMsg)
          }
          const responseData = await response.json()
          const tokenData = responseData.data ?? responseData
          await setChatAuthToken(publicKey, {
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresAt: Date.now() + tokenData.expires_in * 1000,
          })
          await queryClient.invalidateQueries({
            queryKey: ['chatAuth', publicKey],
          })
          onNavigateToChat()
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Authentication failed')
          navigate({ id: 'overview' }, { replace: true })
        } finally {
          setIsPosting(false)
        }
      },
      onError: err => {
        setError(err.message)
        navigate({ id: 'overview' }, { replace: true })
      },
    }),
    [
      onNavigateToChat,
      navigate,
      publicKey,
      chainCodeHex,
      queryClient,
      currentAuthMessage,
    ]
  )

  return (
    <KeysignMutationListenerProvider value={keysignMutationListener}>
      <ChatAuthContext.Provider
        value={{
          error,
          isPosting,
          authMessage: currentAuthMessage,
          onNavigateToChat,
        }}
      >
        <ActiveView views={views} />
      </ChatAuthContext.Provider>
    </KeysignMutationListenerProvider>
  )
}

type ChatAuthContextValue = {
  error: string | null
  isPosting: boolean
  authMessage: string
  onNavigateToChat: () => void
}

const ChatAuthContext = createContext<ChatAuthContextValue>({
  error: null,
  isPosting: false,
  authMessage: '',
  onNavigateToChat: () => {},
})

function AuthOverview() {
  const vault = useCurrentVault()
  const { error, isPosting, authMessage, onNavigateToChat } =
    useContext(ChatAuthContext)

  const keysignPayload: KeysignMessagePayload = useMemo(
    () => ({
      custom: create(CustomMessagePayloadSchema, {
        method: 'personal_sign',
        message: toEip191Hex(authMessage),
        vaultPublicKeyEcdsa: vault ? getVaultId(vault) : '',
      }),
    }),
    [vault, authMessage]
  )

  return (
    <>
      <FlowPageHeader title="Authenticate" onBack={onNavigateToChat} />
      <PageContent gap={16} scrollable>
        <VStack gap={12} padding={16}>
          <Text size={14} color="contrast" weight={500}>
            Sign a message to authenticate with the Vultisig verifier.
          </Text>
          <Text size={12} color="shy">
            This proves you own this vault and enables chat features.
          </Text>
          {error && (
            <Text size={12} color="danger">
              {error}
            </Text>
          )}
          {isPosting && (
            <Text size={12} color="shy">
              Verifying signature...
            </Text>
          )}
        </VStack>
      </PageContent>
      <PageFooter>
        <VStack gap={8}>
          <StartKeysignPrompt keysignPayload={keysignPayload} />
          <Button kind="outlined" onClick={onNavigateToChat}>
            Cancel
          </Button>
        </VStack>
      </PageFooter>
    </>
  )
}
