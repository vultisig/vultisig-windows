import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { getCoinValue } from '@core/chain/coin/utils/getCoinValue'
import { useVaultChainsBalancesQuery } from '@core/ui/vault/queries/useVaultChainsBalancesQuery'
import { useEffect, useRef } from 'react'

type PortfolioRequestEvent = {
  requestId: string
  vaultPubKey: string
}

export const AgentPortfolioBridge = () => {
  const chainsQuery = useVaultChainsBalancesQuery()
  const chainsQueryRef = useRef(chainsQuery)
  chainsQueryRef.current = chainsQuery

  useEffect(() => {
    if (!window.runtime) return

    const onPortfolioRequest = async (data: PortfolioRequestEvent) => {
      const agentService = window.go?.agent?.AgentService
      if (!agentService || !('ProvidePortfolio' in agentService)) {
        return
      }

      try {
        const query = chainsQueryRef.current

        if (query.isPending) {
          await agentService.ProvidePortfolio(
            JSON.stringify({
              requestId: data.requestId,
              error: 'Portfolio data is still loading, please try again',
            })
          )
          return
        }

        const chainBalances = query.data ?? []

        let totalUSD = 0
        const chains: { chain: string; value_usd: number }[] = []
        const coins: {
          chain: string
          ticker: string
          balance: string
          value_usd: number
          price_usd: number
          logo?: string
        }[] = []

        for (const chainBalance of chainBalances) {
          let chainTotal = 0

          for (const coin of chainBalance.coins) {
            const price = coin.price ?? 0
            const value = getCoinValue({ ...coin, price })
            const balance = fromChainAmount(coin.amount, coin.decimals)
            const balanceStr =
              balance === 0
                ? '0'
                : balance < 0.000001
                  ? balance.toExponential(2)
                  : balance.toLocaleString('en-US', {
                      maximumFractionDigits: 6,
                    })

            coins.push({
              chain: chainBalance.chain,
              ticker: coin.ticker,
              balance: balanceStr,
              value_usd: Math.round(value * 100) / 100,
              price_usd: coin.price ?? 0,
              logo: coin.logo,
            })

            chainTotal += value
          }

          chains.push({
            chain: chainBalance.chain,
            value_usd: Math.round(chainTotal * 100) / 100,
          })

          totalUSD += chainTotal
        }

        await agentService.ProvidePortfolio(
          JSON.stringify({
            requestId: data.requestId,
            total_usd: Math.round(totalUSD * 100) / 100,
            chains,
            coins,
          })
        )
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        await agentService.ProvidePortfolio(
          JSON.stringify({
            requestId: data.requestId,
            error: message,
          })
        )
      }
    }

    return window.runtime.EventsOn(
      'agent:portfolio:request',
      onPortfolioRequest as (data: unknown) => void
    )
  }, [])

  return null
}
