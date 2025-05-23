import { areEqualCoins, Coin, extractCoinKey } from '@core/chain/coin/Coin'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getCoinLogoSrc } from '@core/ui/chain/coin/icon/utils/getCoinLogoSrc'
import {
  useAddToCoinFinderIgnoreMutation,
  useRemoveFromCoinFinderIgnoreMutation,
} from '@core/ui/storage/coinFinderIgnore'
import {
  useCreateCoinMutation,
  useDeleteCoinMutation,
} from '@core/ui/storage/coins'
import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { Switch } from '@lib/ui/inputs/switch'
import { HStack } from '@lib/ui/layout/Stack'
import { ListItem } from '@lib/ui/list/item'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useMemo } from 'react'

export const ManageVaultCoin = ({ value }: ValueProp<Coin>) => {
  const currentVaultCoins = useCurrentVaultCoins()
  const createCoin = useCreateCoinMutation()
  const deleteCoin = useDeleteCoinMutation()
  const addToCoinFinderIgnore = useAddToCoinFinderIgnoreMutation()
  const removeFromCoinFinderIgnore = useRemoveFromCoinFinderIgnoreMutation()

  const currentVaultCoin = useMemo(() => {
    return currentVaultCoins.find(c => areEqualCoins(c, value))
  }, [currentVaultCoins, value])

  const handleChange = () => {
    if (currentVaultCoin) {
      addToCoinFinderIgnore.mutate(extractCoinKey(currentVaultCoin), {
        onSuccess: () => deleteCoin.mutate(currentVaultCoin),
      })
    } else {
      removeFromCoinFinderIgnore.mutate(extractCoinKey(value), {
        onSuccess: () => createCoin.mutate(value),
      })
    }
  }

  return (
    <ListItem
      extra={
        <Switch
          checked={!!currentVaultCoin}
          onChange={handleChange}
          loading={createCoin.isPending || deleteCoin.isPending}
        />
      }
      icon={
        <ChainEntityIcon
          value={value.logo ? getCoinLogoSrc(value.logo) : undefined}
          style={{ fontSize: 32 }}
        />
      }
      title={
        <HStack gap={12} alignItems="center">
          <Text color="contrast" size={14} weight={500}>
            {value.ticker}
          </Text>
        </HStack>
      }
    />
  )
}
