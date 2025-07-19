import { EvmChain } from '@core/chain/Chain'
import { productRootDomain, rootApiUrl } from '@core/config'
import { queryUrl } from '@lib/utils/query/queryUrl'
import { useQuery } from '@tanstack/react-query'

type BlockaidRiskLevel = 'Benign' | 'Warning' | 'Malicious' | 'Spam'

type BlockaidScanResponse = {
  validation: {
    result_type: BlockaidRiskLevel
  }
}

const blockaidRiskLevelToTxRiskLevel: Record<BlockaidRiskLevel, TxRiskLevel> = {
  Benign: 'low',
  Warning: 'medium',
  Malicious: 'high',
  Spam: 'high',
}

export type TxRiskLevel = 'low' | 'medium' | 'high'

export type BlockaidTxScanInput = {
  chain: EvmChain
  data: unknown
}

export const useBlockaidTxScanQuery = (input: BlockaidTxScanInput) => {
  return useQuery({
    queryKey: ['blockaidTxScan', input],
    queryFn: async (): Promise<TxRiskLevel> => {
      const { chain, data } = input

      const body = {
        chain: chain.toLowerCase(),
        data,
        metadata: {
          domain: productRootDomain,
        },
      }

      const { validation } = await queryUrl<BlockaidScanResponse>(
        `${rootApiUrl}/blockaid/v0/evm/json-rpc/scan`,
        {
          body,
          headers: {
            origin: rootApiUrl,
            'client-id': 'vultisig-desktop-extension',
          },
        }
      )

      return blockaidRiskLevelToTxRiskLevel[validation.result_type]
    },
    retry: false,
  })
}
