import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { VersionedTransaction } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import { getSolanaClient } from '@vultisig/core-chain/chains/solana/client'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'

/**
 * The fee, in lamports, the cluster charges for the raw transaction being
 * signed, so the fee shown is priced from the exact message.
 */
export const useSolanaRawTxFeeQuery = (rawTransaction: string) =>
  useQuery({
    queryKey: ['solanaRawTxFee', rawTransaction],
    queryFn: async () => {
      const { message } = VersionedTransaction.deserialize(
        Buffer.from(rawTransaction, 'base64')
      )
      const { value } = await getSolanaClient().getFeeForMessage(message)
      return BigInt(shouldBePresent(value, 'Solana fee for message'))
    },
    // Priced once per build: after the blockhash expires a refetch returns no fee.
    ...noRefetchQueryOptions,
  })
