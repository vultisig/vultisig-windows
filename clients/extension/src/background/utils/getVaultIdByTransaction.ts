import { storage } from '@core/extension/storage'
import { getWalletCore } from '@core/extension/tw'
import { CurrentVaultId } from '@core/ui/storage/currentVaultId'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'

import { ITransaction } from '../../utils/interfaces'
import { getParsedSolanaTransaction } from '../../utils/tx/solana/parseSolanaTransaction'

type GetVaultIdByTransactionInput = Pick<ITransaction, 'transactionPayload'>

export const getVaultIdByTransaction = async ({
  transactionPayload,
}: GetVaultIdByTransactionInput): Promise<CurrentVaultId | undefined> => {
  const vaultId = await matchRecordUnion<
    ITransaction['transactionPayload'],
    Promise<CurrentVaultId | undefined>
  >(transactionPayload, {
    keysign: async keysign => {
      const from = keysign.transactionDetails?.from
      return from ? await getVaultIdByAddress(from) : undefined
    },

    custom: async custom =>
      custom.address ? await getVaultIdByAddress(custom.address) : undefined,

    serialized: async serialized => {
      const walletCore = await getWalletCore()
      const parsed = await getParsedSolanaTransaction(
        walletCore,
        serialized.data
      )
      return parsed.authority
        ? await getVaultIdByAddress(parsed.authority)
        : undefined
    },
  })
  return vaultId
}

const getVaultIdByAddress = async (
  address: string
): Promise<string | undefined> => {
  const vaultsCoins = await storage.getCoins()
  for (const [vaultId, coins] of Object.entries(vaultsCoins)) {
    if (coins.some(c => c.address.toLowerCase() === address.toLowerCase())) {
      return vaultId
    }
  }
  return undefined
}
