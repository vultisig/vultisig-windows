import { areEqualCoins, Coin, extractCoinKey } from '@core/chain/coin/Coin'
import {
  useCreateCoinMutation,
  useDeleteCoinMutation,
} from '@core/ui/storage/coins'
import {
  useCurrentVaultAddresses,
  useCurrentVaultCoins,
} from '@core/ui/vault/state/currentVaultCoins'
import { interactive } from '@lib/ui/css/interactive'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { CheckStatus } from '@lib/ui/inputs/checkbox/CheckStatus'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Panel } from '@lib/ui/panel/Panel'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { ReactNode } from 'react'
import styled from 'styled-components'

import {
  useAddToCoinFinderIgnoreMutation,
  useRemoveFromCoinFinderIgnoreMutation,
} from '../../../storage/coinFinderIgnore'

const Container = styled(Panel)`
  ${interactive};
`

const Check = styled(CheckStatus)`
  ${sameDimensions(24)};
`

type ManageVaultCoinProps = ValueProp<Coin> & {
  icon: ReactNode
}

export const ManageVaultCoin = ({ value, icon }: ManageVaultCoinProps) => {
  const coins = useCurrentVaultCoins()
  const isChecked = coins.some(c => areEqualCoins(c, value))

  const { mutate: saveCoin } = useCreateCoinMutation()
  const { mutate: deleteCoin } = useDeleteCoinMutation()

  const { mutate: addToCoinFinderIgnore } = useAddToCoinFinderIgnoreMutation()
  const { mutate: removeFromCoinFinderIgnore } =
    useRemoveFromCoinFinderIgnoreMutation()

  const addresses = useCurrentVaultAddresses()

  /*
   * We don't have a dedicated UI for managing coin finder ignore,
   * so we expect that the user intent to add/remove a coin should be
   * reflected in the coin finder ignore list.
   */
  const handleChange = () => {
    if (isChecked) {
      deleteCoin(
        {
          address: addresses[value.chain],
          ...value,
        },
        {
          onSuccess: () => {
            addToCoinFinderIgnore(extractCoinKey(value))
          },
        }
      )
    } else {
      saveCoin(value, {
        onSuccess: () => {
          removeFromCoinFinderIgnore(extractCoinKey(value))
        },
      })
    }
  }

  return (
    <Container
      data-testid={`ManageVaultChain-Coin-${value.ticker}`}
      onClick={handleChange}
    >
      <HStack fullWidth alignItems="center" justifyContent="space-between">
        <HStack alignItems="center" gap={16}>
          {icon}
          <VStack>
            <Text size={18} weight="700" color="contrast">
              {value.ticker}
            </Text>
            <Text size={14} weight="600" color="contrast">
              {value.chain}
            </Text>
          </VStack>
        </HStack>
        <Check value={isChecked} />
      </HStack>
    </Container>
  )
}
