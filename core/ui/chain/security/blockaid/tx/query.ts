import { EvmChain } from '@core/chain/Chain'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { productRootDomain } from '@core/config'
import { getKeysignSwapPayload } from '@core/mpc/keysign/swap/getKeysignSwapPayload'
import { getKeysignChain } from '@core/mpc/keysign/utils/getKeysignChain'
import { getKeysignCoin } from '@core/mpc/keysign/utils/getKeysignCoin'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { bigIntToHex } from '@lib/utils/bigint/bigIntToHex'
import { NotImplementedError } from '@lib/utils/error/NotImplementedError'
import { queryUrl } from '@lib/utils/query/queryUrl'
import { useQuery } from '@tanstack/react-query'

type BlockaidRiskLevel = 'benign' | 'warning' | 'malicious' | 'spam'

type BlockaidScanResponse = {
  validation: {
    classification: BlockaidRiskLevel
  }
}

const blockaidRiskLevelToTxRiskLevel: Record<BlockaidRiskLevel, TxRiskLevel> = {
  benign: 'low',
  warning: 'medium',
  malicious: 'high',
  spam: 'high',
}

export type TxRiskLevel = 'low' | 'medium' | 'high'

export const useBlockaidTxScanQuery = (keysignPayload: KeysignPayload) => {
  return useQuery({
    queryKey: ['blockaidTxScan', keysignPayload],
    queryFn: async (): Promise<TxRiskLevel> => {
      const coin = getKeysignCoin(keysignPayload)
      const chain = getKeysignChain(keysignPayload)

      if (!isOneOf(chain, Object.values(EvmChain))) {
        throw new NotImplementedError('non-EVM chains Blockaid tx scan')
      }

      const swapPayload = getKeysignSwapPayload(keysignPayload)

      if (swapPayload) {
        throw new NotImplementedError('Blockaid swap tx scan')
      }

      if (!isFeeCoin(coin)) {
        throw new NotImplementedError('ERC20 send tx scan')
      }

      const body = {
        chain: chain.toLowerCase(),
        data: {
          method: 'eth_sendTransaction',
          params: [
            {
              from: coin.address,
              to: keysignPayload.toAddress,
              value: bigIntToHex(BigInt(keysignPayload.toAmount)),
              data: keysignPayload.memo || '0x',
            },
          ],
        },
        metadata: {
          domain: productRootDomain,
        },
      }

      const { validation } = await queryUrl<BlockaidScanResponse>(
        'https://api.blockaid.io/v1/ethereum/scan/transaction',
        {
          body,
        }
      )

      return blockaidRiskLevelToTxRiskLevel[validation.classification]
    },
    retry: false,
  })
}
