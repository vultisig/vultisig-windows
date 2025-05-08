import { areEqualCoins, Coin } from '@core/chain/coin/Coin'
import {
  useCreateCoinMutation,
  useDeleteCoinMutation,
} from '@core/ui/storage/coins'
import {
  useCurrentVaultAddreses,
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
  const addresses = useCurrentVaultAddreses()
  return (
    <Container
      data-testid={`ManageVaultChain-Coin-${value.ticker}`}
      onClick={() => {
        if (isChecked) {
          deleteCoin({
            address: addresses[value.chain],
            ...value,
          })
        } else {
          saveCoin(value)
        }
      }}
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
