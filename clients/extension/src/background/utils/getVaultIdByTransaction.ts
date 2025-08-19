import { storage } from '@core/extension/storage'
import { CurrentVaultId } from '@core/ui/storage/currentVaultId'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'

import { ITransaction } from '../../utils/interfaces'
import { parseSolanaTx } from '../../utils/tx/solana/parser'
import { getWalletCore } from '../walletCore'

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
      const parsed = await parseSolanaTx(walletCore, serialized.data)
      if (parsed)
        return parsed.authority
          ? await getVaultIdByAddress(parsed.authority)
          : undefined
      return undefined
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
