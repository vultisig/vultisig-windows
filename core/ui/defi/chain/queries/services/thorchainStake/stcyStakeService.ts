import { cosmosRpcUrl } from '@vultisig/core-chain/chains/cosmos/cosmosRpcUrl'
import { tcyAutoCompounderConfig } from '@vultisig/core-chain/chains/cosmos/thor/tcy-autocompound/config'
import { coinKeyToString } from '@vultisig/core-chain/coin/Coin'
import { getCoinValue } from '@vultisig/core-chain/coin/utils/getCoinValue'
import { queryUrl } from '@vultisig/lib-utils/query/queryUrl'

import { thorchainTokens } from '../../tokens'
import { ThorchainStakePosition } from '../../types'
import { parseBigint } from '../../utils/parsers'

const bankApiBase = `${cosmosRpcUrl.THORChain}/cosmos/bank/v1beta1`

type BankBalanceResponse = {
  balance?: { amount?: string }
}

type BankSupplyResponse = {
  amount?: { amount?: string }
}

const getBalanceByDenom = (address: string, denom: string) =>
  queryUrl<BankBalanceResponse>(
    `${bankApiBase}/balances/${address}/by_denom?denom=${encodeURIComponent(denom)}`
  )

const getSupplyByDenom = (denom: string) =>
  queryUrl<BankSupplyResponse>(
    `${bankApiBase}/supply/by_denom?denom=${encodeURIComponent(denom)}`
  )

const getUnderlyingTcyAmount = ({
  shares,
  vaultBalance,
  shareSupply,
}: {
  shares: bigint
  vaultBalance: bigint
  shareSupply: bigint
}) => {
  if (shares <= 0n || vaultBalance <= 0n || shareSupply <= 0n) return 0n

  return (shares * vaultBalance) / shareSupply
}

type FetchStcyStakePositionInput = {
  address: string
  prices: Record<string, number>
}

export const fetchStcyStakePosition = async ({
  address,
  prices,
}: FetchStcyStakePositionInput): Promise<ThorchainStakePosition | null> => {
  try {
    const balance = await getBalanceByDenom(
      address,
      tcyAutoCompounderConfig.shareDenom
    )
    const amount = parseBigint(balance?.balance?.amount)

    let underlyingTcyAmount = 0n
    if (amount > 0n) {
      try {
        const [vaultBalance, supply] = await Promise.all([
          getBalanceByDenom(
            tcyAutoCompounderConfig.contract,
            tcyAutoCompounderConfig.depositDenom
          ),
          getSupplyByDenom(tcyAutoCompounderConfig.shareDenom),
        ])

        underlyingTcyAmount = getUnderlyingTcyAmount({
          shares: amount,
          vaultBalance: parseBigint(vaultBalance?.balance?.amount),
          shareSupply: parseBigint(supply?.amount?.amount),
        })
      } catch {
        // Keep the share position visible, but do not silently fall back to the
        // known-wrong 1:1 valuation when the live redemption rate is missing.
      }
    }

    const price = prices[coinKeyToString(thorchainTokens.tcy)] ?? 0
    const fiatValue = getCoinValue({
      amount: underlyingTcyAmount,
      decimals: tcyAutoCompounderConfig.depositDecimals,
      price,
    })

    return {
      id: 'thor-stake-stcy',
      ticker: thorchainTokens.stcy.ticker,
      amount,
      type: 'stake',
      canUnstake: amount > 0n,
      fiatValue,
      estimatedReward: 0,
    }
  } catch {
    return null
  }
}
