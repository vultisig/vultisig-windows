import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { Chain } from '@core/chain/Chain'
import { StartKeysignView } from '@core/extension/keysign/start/StartKeysignView'
import { KeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import { buildSendKeysignPayload } from '@core/mpc/keysign/send/build'
import { getVaultId } from '@core/mpc/vault/Vault'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { FlowPageHeader } from '@core/ui/flow/FlowPageHeader'
import {
  KeysignMutationListener,
  KeysignMutationListenerProvider,
} from '@core/ui/mpc/keysign/action/state/keysignMutationListener'
import { StartKeysignPrompt } from '@core/ui/mpc/keysign/prompt/StartKeysignPrompt'
import { CoreView, CoreViewState } from '@core/ui/navigation/CoreView'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import {
  useCurrentVault,
  useCurrentVaultPublicKey,
} from '@core/ui/vault/state/currentVault'
import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
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
  useEffect,
  useMemo,
  useState,
} from 'react'

type ChatActionSignView =
  | { id: 'overview' }
  | Extract<CoreView, { id: 'keysign' }>

const views: Views<ChatActionSignView['id']> = {
  keysign: StartKeysignView,
  overview: ActionSignOverview,
}

type ActionSignState = CoreViewState<'chatActionSign'>

type ActionSignContextValue = ActionSignState & {
  error: string | null
  isBuilding: boolean
  keysignPayload: KeysignMessagePayload | null
  onNavigateToChat: () => void
}

const ActionSignContext = createContext<ActionSignContextValue>({
  actionType: '',
  actionId: '',
  actionParams: {},
  error: null,
  isBuilding: true,
  keysignPayload: null,
  onNavigateToChat: () => {},
})

export const ChatActionSignPage = () => {
  const [viewState] = useViewState<ActionSignState>()
  const coreNavigate = useCoreNavigate()

  const navigateToChat = useCallback(() => {
    coreNavigate({ id: 'chat' })
  }, [coreNavigate])

  return (
    <NavigationProvider initialValue={{ history: [{ id: 'overview' }] }}>
      <ActionSignNavigationWrapper
        {...viewState}
        onNavigateToChat={navigateToChat}
      />
    </NavigationProvider>
  )
}

type ActionSignNavigationWrapperProps = ActionSignState & {
  onNavigateToChat: () => void
}

const ActionSignNavigationWrapper = ({
  onNavigateToChat,
  ...state
}: ActionSignNavigationWrapperProps) => {
  const navigate = useNavigate<ChatActionSignView>()
  const [error, setError] = useState<string | null>(null)
  const [isBuilding, setIsBuilding] = useState(true)
  const [keysignPayload, setKeysignPayload] =
    useState<KeysignMessagePayload | null>(null)

  const vault = useCurrentVault()
  const coins = useCurrentVaultCoins()
  const walletCore = useAssertWalletCore()

  // Resolve chain from action params
  const chainName = useMemo(() => {
    const params = state.actionParams
    if (params.chain) return params.chain as string
    // For sign_tx with hydrated build data
    const txData = params.tx_data as Record<string, unknown> | undefined
    if (txData?.chain) return txData.chain as string
    // Try to get from build_tool specific fields
    const buildTool = params.build_tool as string | undefined
    if (buildTool?.includes('btc')) return 'Bitcoin'
    if (buildTool?.includes('ltc')) return 'Litecoin'
    if (buildTool?.includes('doge')) return 'Dogecoin'
    if (buildTool?.includes('bch')) return 'Bitcoin-Cash'
    if (buildTool?.includes('dash')) return 'Dash'
    if (buildTool?.includes('zec')) return 'Zcash'
    if (buildTool?.includes('solana')) return 'Solana'
    if (buildTool?.includes('xrp')) return 'Ripple'
    if (buildTool?.includes('gaia')) return 'Cosmos'
    return null
  }, [state.actionParams])

  const chain = chainName as Chain | null

  // Get public key for the chain (only when chain is resolved)
  const publicKey = useCurrentVaultPublicKey((chain as Chain) ?? Chain.Ethereum)

  // Build keysign payload from action params
  useEffect(() => {
    const buildPayload = async () => {
      setIsBuilding(true)
      setError(null)

      try {
        const params = state.actionParams

        if (state.actionType === 'build_send_tx') {
          // Send flow: params have chain, symbol, address, amount, memo
          const sendChain = params.chain as string
          const symbol = params.symbol as string
          const address = params.address as string
          const amount = params.amount as string
          const memo = (params.memo as string) || undefined

          // Find coin in vault
          const coin = coins.find(
            c =>
              c.chain === sendChain &&
              c.ticker.toLowerCase() === symbol.toLowerCase()
          )
          if (!coin) {
            throw new Error(`Coin ${symbol} on ${sendChain} not found in vault`)
          }

          const chainAmount = toChainAmount(parseFloat(amount), coin.decimals)

          const payload = await buildSendKeysignPayload({
            coin,
            receiver: address,
            amount: chainAmount,
            memo,
            vaultId: getVaultId(vault),
            localPartyId: vault.localPartyId,
            publicKey,
            libType: vault.libType,
            walletCore,
          })

          setKeysignPayload({ keysign: payload })
        } else if (
          state.actionType === 'sign_tx' ||
          state.actionType === 'build_custom_tx'
        ) {
          // sign_tx with hydrated params from backend
          // build_custom_tx with action params
          // TODO: implement swap and custom tx payload building
          throw new Error(
            `Transaction type ${state.actionType} signing not yet implemented. Backend hydration required for swap transactions.`
          )
        } else {
          throw new Error(`Unknown action type: ${state.actionType}`)
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to build transaction'
        )
      } finally {
        setIsBuilding(false)
      }
    }

    buildPayload()
  }, [
    state.actionType,
    state.actionParams,
    coins,
    vault,
    publicKey,
    walletCore,
  ])

  const keysignMutationListener: KeysignMutationListener = useMemo(
    () => ({
      onSuccess: result => {
        // Extract tx hash from keysign result
        const txs = getRecordUnionValue(result, 'txs')
        const txHash = txs[txs.length - 1]?.hash ?? ''

        sessionStorage.setItem(
          'chat_pending_action',
          JSON.stringify({
            action: state.actionType,
            action_id: state.actionId,
            success: true,
            data: { txid: txHash },
          })
        )
        onNavigateToChat()
      },
      onError: err => {
        const errorMessage = err.message || 'Signing failed'
        // Check if this is a user cancellation
        const isUserCancel =
          errorMessage.toLowerCase().includes('cancel') ||
          errorMessage.toLowerCase().includes('dismiss') ||
          errorMessage.toLowerCase().includes('password')

        sessionStorage.setItem(
          'chat_pending_action',
          JSON.stringify({
            action: state.actionType,
            action_id: state.actionId,
            success: false,
            error: isUserCancel ? 'User cancelled signing' : errorMessage,
          })
        )
        if (isUserCancel) {
          onNavigateToChat()
        } else {
          setError(errorMessage)
          navigate({ id: 'overview' }, { replace: true })
        }
      },
    }),
    [onNavigateToChat, navigate, state.actionType, state.actionId]
  )

  const contextValue = useMemo(
    () => ({
      ...state,
      error,
      isBuilding,
      keysignPayload,
      onNavigateToChat,
    }),
    [state, error, isBuilding, keysignPayload, onNavigateToChat]
  )

  return (
    <KeysignMutationListenerProvider value={keysignMutationListener}>
      <ActionSignContext.Provider value={contextValue}>
        <ActiveView views={views} />
      </ActionSignContext.Provider>
    </KeysignMutationListenerProvider>
  )
}

function ActionSignOverview() {
  const {
    actionType,
    actionParams,
    error,
    isBuilding,
    keysignPayload,
    onNavigateToChat,
  } = useContext(ActionSignContext)

  const handleCancel = useCallback(() => {
    sessionStorage.setItem(
      'chat_pending_action',
      JSON.stringify({
        action: actionType,
        success: false,
        error: 'User cancelled signing',
      })
    )
    onNavigateToChat()
  }, [actionType, onNavigateToChat])

  // Build transaction description
  const description = useMemo(() => {
    if (actionType === 'build_send_tx') {
      const chain = actionParams.chain as string
      const symbol = actionParams.symbol as string
      const amount = actionParams.amount as string
      const address = actionParams.address as string
      const truncAddr = address
        ? `${address.slice(0, 6)}...${address.slice(-4)}`
        : ''
      return `Send ${amount} ${symbol} to ${truncAddr} on ${chain}`
    }
    if (actionType === 'sign_tx') {
      return 'Sign and broadcast transaction'
    }
    if (actionType === 'build_custom_tx') {
      const txType = actionParams.tx_type as string
      const chain = actionParams.chain as string
      return `Execute ${txType || 'custom'} transaction on ${chain || 'chain'}`
    }
    return 'Sign transaction'
  }, [actionType, actionParams])

  return (
    <>
      <FlowPageHeader title="Sign Transaction" onBack={handleCancel} />
      <PageContent gap={16} scrollable>
        <VStack gap={12} padding={16}>
          <Text size={14} color="contrast" weight={500}>
            {description}
          </Text>
          <Text size={12} color="shy">
            Review the transaction details and sign to broadcast it on-chain.
          </Text>
          {isBuilding && (
            <VStack alignItems="center" gap={8}>
              <Spinner />
              <Text size={12} color="shy">
                Building transaction...
              </Text>
            </VStack>
          )}
          {error && (
            <Text size={12} color="danger">
              {error}
            </Text>
          )}
        </VStack>
      </PageContent>
      <PageFooter>
        <VStack gap={8}>
          {keysignPayload && !isBuilding && (
            <StartKeysignPrompt keysignPayload={keysignPayload} />
          )}
          <Button kind="outlined" onClick={handleCancel}>
            Cancel
          </Button>
        </VStack>
      </PageFooter>
    </>
  )
}
