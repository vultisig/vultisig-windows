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
import { CoreView, CoreViewState } from '@core/ui/navigation/CoreView'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { ActiveView } from '@lib/ui/navigation/ActiveView'
import { useNavigate } from '@lib/ui/navigation/hooks/useNavigate'
import { useViewState } from '@lib/ui/navigation/hooks/useViewState'
import { NavigationProvider } from '@lib/ui/navigation/state'
import { Views } from '@lib/ui/navigation/Views'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { Text } from '@lib/ui/text'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

import { verifierUrl } from '../state/chatConfig'
import { toEip191Hex } from '../utils/toEip191Hex'

type ChatPolicySignView =
  | { id: 'overview' }
  | Extract<CoreView, { id: 'keysign' }>

const views: Views<ChatPolicySignView['id']> = {
  keysign: StartKeysignView,
  overview: PolicySignOverview,
}

type PolicySignState = CoreViewState<'chatPolicySign'>

type PolicySignContextValue = PolicySignState & {
  error: string | null
  isPosting: boolean
  onNavigateToChat: () => void
}

const PolicySignContext = createContext<PolicySignContextValue>({
  pluginId: '',
  recipe: '',
  signingMessage: '',
  policyId: '',
  publicKey: '',
  policyVersion: 1,
  pluginVersion: 1,
  accessToken: '',
  error: null,
  isPosting: false,
  onNavigateToChat: () => {},
})

export const ChatPolicySignPage = () => {
  const [viewState] = useViewState<PolicySignState>()
  // coreNavigate must be called HERE — above the local NavigationProvider —
  // so it uses the app-level navigation context, not the local one.
  const coreNavigate = useCoreNavigate()

  const navigateToChat = useCallback(() => {
    coreNavigate({ id: 'chat' })
  }, [coreNavigate])

  return (
    <NavigationProvider initialValue={{ history: [{ id: 'overview' }] }}>
      <PolicySignNavigationWrapper
        {...viewState}
        onNavigateToChat={navigateToChat}
      />
    </NavigationProvider>
  )
}

type PolicySignNavigationWrapperProps = PolicySignState & {
  onNavigateToChat: () => void
}

const PolicySignNavigationWrapper = ({
  onNavigateToChat,
  ...state
}: PolicySignNavigationWrapperProps) => {
  const navigate = useNavigate<ChatPolicySignView>()
  const [error, setError] = useState<string | null>(null)
  const [isPosting, setIsPosting] = useState(false)

  const keysignMutationListener: KeysignMutationListener = useMemo(
    () => ({
      onSuccess: async result => {
        const signature = getRecordUnionValue(result, 'signature')
        setIsPosting(true)
        setError(null)
        try {
          const response = await fetch(`${verifierUrl}/plugin/policy`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${state.accessToken}`,
            },
            body: JSON.stringify({
              id: state.policyId,
              active: true,
              public_key: state.publicKey,
              plugin_id: state.pluginId,
              plugin_version: String(state.pluginVersion),
              policy_version: state.policyVersion,
              recipe: state.recipe,
              signature,
            }),
          })
          if (!response.ok) {
            const body = await response.text()
            throw new Error(
              `Policy creation failed: ${response.status} ${body}`
            )
          }
          sessionStorage.setItem(
            'chat_pending_action',
            JSON.stringify({
              action: 'create_policy',
              success: true,
            })
          )
          onNavigateToChat()
        } catch (err) {
          setError(
            err instanceof Error ? err.message : 'Policy creation failed'
          )
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
    [onNavigateToChat, navigate, state]
  )

  const contextValue = useMemo(
    () => ({ ...state, error, isPosting, onNavigateToChat }),
    [state, error, isPosting, onNavigateToChat]
  )

  return (
    <KeysignMutationListenerProvider value={keysignMutationListener}>
      <PolicySignContext.Provider value={contextValue}>
        <ActiveView views={views} />
      </PolicySignContext.Provider>
    </KeysignMutationListenerProvider>
  )
}

function PolicySignOverview() {
  const vault = useCurrentVault()
  const { signingMessage, error, isPosting, onNavigateToChat } =
    useContext(PolicySignContext)

  const keysignPayload: KeysignMessagePayload = useMemo(
    () => ({
      custom: create(CustomMessagePayloadSchema, {
        method: 'personal_sign',
        message: toEip191Hex(signingMessage),
        vaultPublicKeyEcdsa: vault ? getVaultId(vault) : '',
      }),
    }),
    [vault, signingMessage]
  )

  const handleCancel = useCallback(() => {
    sessionStorage.setItem(
      'chat_pending_action',
      JSON.stringify({
        action: 'create_policy',
        success: false,
        error: 'Cancelled by user',
      })
    )
    onNavigateToChat()
  }, [onNavigateToChat])

  return (
    <>
      <FlowPageHeader title="Sign Policy" onBack={handleCancel} />
      <PageContent gap={16} scrollable>
        <VStack gap={12} padding={16}>
          <Text size={14} color="contrast" weight={500}>
            Review and sign the policy to activate it.
          </Text>
          <Text size={12} color="shy">
            This will create a policy that governs what the plugin can do with
            your vault.
          </Text>
          {error && (
            <Text size={12} color="danger">
              {error}
            </Text>
          )}
          {isPosting && (
            <Text size={12} color="shy">
              Submitting policy to verifier...
            </Text>
          )}
        </VStack>
      </PageContent>
      <PageFooter>
        <VStack gap={8}>
          <StartKeysignPrompt keysignPayload={keysignPayload} />
          <Button kind="outlined" onClick={handleCancel}>
            Cancel
          </Button>
        </VStack>
      </PageFooter>
    </>
  )
}
