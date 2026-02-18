import { Chain } from '@core/chain/Chain'
import { getCoinBalance } from '@core/chain/coin/balance'
import { useEffect } from 'react'

type BalanceRequestEvent = {
  requestId: string
  chain: string
  address: string
  id: string
}

export const AgentBalanceBridge = () => {
  useEffect(() => {
    if (!window.runtime) return

    const onBalanceRequest = async (data: BalanceRequestEvent) => {
      const agentService = window.go?.agent?.AgentService
      if (!agentService || !('ProvideBalance' in agentService)) {
        return
      }

      try {
        const balance = await getCoinBalance({
          chain: data.chain as Chain,
          address: data.address,
          id: data.id || undefined,
        })

        await agentService.ProvideBalance(
          JSON.stringify({
            requestId: data.requestId,
            balance: balance.toString(),
          })
        )
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        try {
          await agentService.ProvideBalance(
            JSON.stringify({
              requestId: data.requestId,
              error: message,
            })
          )
        } catch {
          // best-effort error reporting
        }
      }
    }

    return window.runtime.EventsOn(
      'agent:balance:request',
      onBalanceRequest as (data: unknown) => void
    )
  }, [])

  return null
}
