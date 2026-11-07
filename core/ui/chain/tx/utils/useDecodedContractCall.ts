import { useGetCoin } from '@core/ui/chain/coin/useGetCoin'
import { useQuery } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'
import { EvmContractCallInfo } from '@vultisig/core-chain/chains/evm/contract/call/info'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import { capitalizeFirstLetter } from '@vultisig/lib-utils/capitalizeFirstLetter'
import { useTranslation } from 'react-i18next'

import { extractTokenAndAmount } from './extractTokenAndAmount'
import { formatTokenAmount } from './formatTokenAmount'
import { useEvmContractCallInfoQuery } from './useEvmContractCallInfoQuery'

/** A decoded token call ready to show, e.g. `Approve` and `Unlimited USDT`. */
export type DecodedContractCall = {
  coin: Coin
  functionName: string
  display: string
  isUnlimited: boolean
}

type UseDecodedContractCallInput = {
  calldata: string | undefined
  /** The contract the call is sent to: the token for ERC-20 / TRC-20 methods. */
  callTarget: string | undefined
  chain: Chain
  enabled: boolean
  /** Rewrites the decoded call before reading it, e.g. a TRON call's addresses. */
  formatInfo?: (info: EvmContractCallInfo) => EvmContractCallInfo
}

/**
 * Decodes a contract call into the token it moves or approves and the amount,
 * flagging an unlimited approval. Null until the call and its token resolve,
 * and for a call that is not a known token method.
 *
 * The call query is keyed by calldata, so it shares its cache with every other
 * screen decoding the same call and the 4byte signature is not refetched.
 */
export const useDecodedContractCall = ({
  calldata,
  callTarget,
  chain,
  enabled,
  formatInfo,
}: UseDecodedContractCallInput): DecodedContractCall | null => {
  const { t } = useTranslation()
  const getCoin = useGetCoin()
  const contractCallQuery = useEvmContractCallInfoQuery({
    memo: calldata,
    enabled,
  })
  const info =
    contractCallQuery.data && formatInfo
      ? formatInfo(contractCallQuery.data)
      : contractCallQuery.data
  const tokenPair = info
    ? extractTokenAndAmount(
        info.functionSignature,
        info.functionArguments,
        callTarget
      )
    : null
  const tokenQuery = useQuery({
    queryKey: ['resolveToken', tokenPair?.tokenAddress, chain],
    queryFn: () => getCoin({ id: tokenPair!.tokenAddress, chain }),
    enabled: !!tokenPair,
    staleTime: Infinity,
  })
  const rawFunctionName = info?.functionSignature.split('(')[0]

  if (!tokenQuery.data || !tokenPair || !rawFunctionName) {
    return null
  }

  const fmt = formatTokenAmount({
    rawAmount: BigInt(tokenPair.rawAmount),
    decimals: tokenQuery.data.decimals,
    functionName: rawFunctionName,
  })
  // MAX_UINT256 in a non-approval (withdraw/repay) — exact amount depends on
  // on-chain state, so skip the row entirely.
  if (!fmt.display) {
    return null
  }

  const amountLabel = fmt.isSentinel ? t('unlimited') : fmt.display
  return {
    coin: tokenQuery.data,
    functionName: capitalizeFirstLetter(rawFunctionName),
    display: `${amountLabel} ${tokenQuery.data.ticker}`,
    isUnlimited: fmt.isSentinel,
  }
}
