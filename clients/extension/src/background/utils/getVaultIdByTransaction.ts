import { storage } from '@core/extension/storage'
import { CurrentVaultId } from '@core/ui/storage/currentVaultId'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'

import { ITransaction } from '../../utils/interfaces'
import { getParsedSolanaTransaction } from '../../utils/tx/solana/parseSolanaTransaction'
import { getWalletCore } from '../walletCore'

export const getVaultIdByTransaction = async (
  transaction: ITransaction
): Promise<string> => {
  const resolved = await matchRecordUnion<
    ITransaction['transactionPayload'],
    Promise<CurrentVaultId | undefined>
  >(transaction.transactionPayload, {
    keysign: async keysign =>
      keysign.transactionDetails.from
        ? await getVaultIdByAddress(keysign.transactionDetails.from)
        : undefined,

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
  return resolved ?? shouldBePresent(await storage.getCurrentVaultId())
}

const getVaultIdByAddress = async (address: string) => {
  const vaultsCoins = await storage.getCoins()
  for (const [vaultId, coins] of Object.entries(vaultsCoins)) {
    if (coins.some(c => c.address.toLowerCase() === address.toLowerCase())) {
      await storage.setCurrentVaultId(vaultId)
      return vaultId
    }
  }
  return await storage.getCurrentVaultId()
}
