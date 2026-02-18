import { Chain } from '@core/chain/Chain'
import { CoinKey } from '@core/chain/coin/Coin'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { CoreView } from '@core/ui/navigation/CoreView'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useNavigate } from '@lib/ui/navigation/hooks/useNavigate'
import { useCallback, useEffect, useRef } from 'react'

import { toolHandlers } from '../tools'
import { setWalletContext } from '../tools/shared/walletContext'
import type { CoinInfo, ToolContext, ToolHandlerResult } from '../tools/types'

type ToolRequestEvent = {
  requestId: string
  toolName: string
  input: Record<string, unknown>
  context: {
    vaultPubKey: string
    vaultName: string
    authToken?: string
    coins: CoinInfo[]
  }
}

type NavigationData = {
  id: string
  state?: Record<string, unknown>
}

function buildCoinKey(coin: { chain: string; id?: string }): CoinKey {
  const result: { chain: Chain; id?: string } = {
    chain: coin.chain as Chain,
  }
  if (coin.id) {
    result.id = coin.id
  }
  return result
}

function processNavigation(
  nav: NavigationData,
  vault: { coins?: Array<{ chain: string; id?: string }> } | undefined
): CoreView | null {
  if (nav.id === 'send') {
    const state = nav.state || {}
    const coin = state.coin as { chain: string; id?: string } | undefined
    if (!coin) return null

    const coinKey = buildCoinKey(coin)
    const vaultCoins = vault?.coins ?? []
    const coinExists = vaultCoins.some(
      vc =>
        vc.chain === coinKey.chain &&
        vc.id?.toLowerCase() === coinKey.id?.toLowerCase()
    )
    if (!coinExists) return null

    const amountStr = state.amount as string | undefined
    let amount: bigint | undefined
    if (amountStr && /^\d+$/.test(String(amountStr))) {
      amount = BigInt(amountStr)
    }
    const hasAllSendParams = amount && state.address
    return {
      id: 'send',
      state: {
        coin: coinKey,
        address: state.address as string | undefined,
        amount,
        memo: state.memo as string | undefined,
        skipToVerify: hasAllSendParams ? true : undefined,
      },
    }
  }

  return null
}

export const AgentToolBridge = () => {
  const vault = useCurrentVault()
  const walletCore = useAssertWalletCore()
  const navigate = useNavigate<CoreView>()
  const navigateRef = useRef(navigate)
  navigateRef.current = navigate
  const vaultRef = useRef(vault)
  vaultRef.current = vault

  useEffect(() => {
    if (vault && walletCore) {
      setWalletContext({ walletCore, vault })
    }
    return () => setWalletContext(null)
  }, [vault, walletCore])

  const handleResult = useCallback((result: ToolHandlerResult) => {
    const nav = result.data?.navigation as NavigationData | undefined
    if (!nav || !nav.id) return

    const view = processNavigation(nav, vaultRef.current)
    if (view) {
      navigateRef.current(view)
    }
  }, [])

  useEffect(() => {
    if (!window.runtime) return

    const onToolRequest = async (data: ToolRequestEvent) => {
      const agentService = window.go?.agent?.AgentService
      if (!agentService || !('ProvideToolResult' in agentService)) {
        return
      }

      const sendResponse = async (response: Record<string, unknown>) => {
        try {
          await agentService.ProvideToolResult(JSON.stringify(response))
        } catch {
          // best-effort
        }
      }

      const handler = toolHandlers[data.toolName]
      if (!handler) {
        await sendResponse({
          requestId: data.requestId,
          error: `Unknown tool: ${data.toolName}`,
        })
        return
      }

      const context: ToolContext = {
        vaultPubKey: data.context.vaultPubKey,
        vaultName: data.context.vaultName,
        authToken: data.context.authToken,
        coins: data.context.coins ?? [],
      }

      try {
        const result = await handler(data.input, context)
        handleResult(result)
        await sendResponse({
          requestId: data.requestId,
          result: JSON.stringify(result.data),
          vaultModified: result.vaultModified ?? false,
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        await sendResponse({
          requestId: data.requestId,
          error: message,
        })
      }
    }

    return window.runtime.EventsOn(
      'agent:tool:request',
      onToolRequest as (data: unknown) => void
    )
  }, [handleResult])

  return null
}
