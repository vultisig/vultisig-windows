import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import {
  areEqualCoins,
  coinMetadataFields,
} from '@vultisig/core-chain/coin/Coin'
import { coins } from '@vultisig/core-chain/coin/coins'
import { areEqualRecords } from '@vultisig/lib-utils/record/areEqualRecords'
import { pick } from '@vultisig/lib-utils/record/pick'
import { useEffect } from 'react'

import { useCreateCoinsMutation } from '../../../../storage/coins'
import { useAssertCurrentVaultId } from '../../../../storage/currentVaultId'

export const CoinsMetadataManager = () => {
  const vaultCoins = useCurrentVaultCoins()
  const vaultId = useAssertCurrentVaultId()

  const { mutate: saveCoins, isPending, error } = useCreateCoinsMutation()

  useEffect(() => {
    if (isPending || error) return

    const updatedCoins = vaultCoins.reduce<AccountCoin[]>((acc, vaultCoin) => {
      const coinInfo = coins.find(coin => areEqualCoins(coin, vaultCoin))

      if (!coinInfo) {
        return acc
      }

      const coinMetadata = pick(coinInfo, coinMetadataFields)
      const vaultCoinMetadata = pick(vaultCoin, coinMetadataFields)

      if (!areEqualRecords(coinMetadata, vaultCoinMetadata)) {
        return [
          ...acc,
          {
            ...vaultCoin,
            ...coinMetadata,
          },
        ]
      }

      return acc
    }, [])

    if (updatedCoins.length > 0) {
      console.log('CoinsMetadataManager: updating coins metadata', updatedCoins)
      saveCoins({
        vaultId,
        coins: updatedCoins,
      })
    }
  }, [error, isPending, saveCoins, vaultCoins, vaultId])

  return null
}
