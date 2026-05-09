import { useQuery } from '@tanstack/react-query'
import { getEvmContractCallInfo } from '@vultisig/core-chain/chains/evm/contract/call/info'

type UseEvmContractCallInfoQueryInput = {
  memo: string | undefined
  enabled?: boolean
}

export const useEvmContractCallInfoQuery = ({
  memo,
  enabled = true,
}: UseEvmContractCallInfoQueryInput) =>
  useQuery({
    queryKey: ['evmContractCallInfo', memo],
    queryFn: () => getEvmContractCallInfo(memo!),
    enabled: enabled && !!memo && memo.startsWith('0x') && memo.length > 2,
    staleTime: Infinity,
  })
