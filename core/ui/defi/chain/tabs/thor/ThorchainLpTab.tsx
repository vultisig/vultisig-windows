import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { useThorLpPositionsQuery } from '@core/ui/defi/chain/thor/hooks'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Panel } from '@lib/ui/panel/Panel'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { formatAmount } from '@lib/utils/formatAmount'
import styled from 'styled-components'

const format8 = (value: bigint) =>
  formatAmount(fromChainAmount(value, 8), { precision: 'high' })

export const ThorchainLpTab = () => {
  const { data, isPending, isError } = useThorLpPositionsQuery()
  const navigate = useCoreNavigate()

  if (isPending) {
    return (
      <HStack justifyContent="center">
        <Spinner />
      </HStack>
    )
  }

  if (isError) {
    return (
      <Text color="danger" size={14}>
        Failed to load LP positions.
      </Text>
    )
  }

  const positions = data ?? []

  if (positions.length === 0) {
    return (
      <Panel>
        <Text size={14} color="shy">
          No LP positions found for this address.
        </Text>
      </Panel>
    )
  }

  return (
    <VStack gap={12}>
      {positions.map(position => (
        <LpCard key={`${position.asset}-${position.asset_address ?? ''}`}>
          <VStack gap={4}>
            <Text size={14} weight="600">
              {position.asset}
            </Text>
            <Text size={12} color="shy">
              Rune deposit:{' '}
              {format8(BigInt(position.rune_deposit_value ?? '0'))}
            </Text>
            <Text size={12} color="shy">
              Asset deposit:{' '}
              {format8(BigInt(position.asset_deposit_value ?? '0'))}
            </Text>
          </VStack>
          <Actions>
            <ActionButton
              onClick={() =>
                navigate({
                  id: 'deposit',
                  state: { coin: chainFeeCoin.THORChain, action: 'custom' },
                })
              }
            >
              Remove
            </ActionButton>
            <PrimaryAction
              onClick={() =>
                navigate({
                  id: 'deposit',
                  state: { coin: chainFeeCoin.THORChain, action: 'custom' },
                })
              }
            >
              Add
            </PrimaryAction>
          </Actions>
        </LpCard>
      ))}
    </VStack>
  )
}

const LpCard = styled(Panel)`
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`

const Actions = styled(HStack)`
  gap: 10px;
`

const ActionButton = styled.button`
  border: 1px solid ${getColor('foregroundExtra')};
  background: transparent;
  color: ${getColor('contrast')};
  padding: 10px 14px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
`

const PrimaryAction = styled(ActionButton)`
  background: ${getColor('buttonPrimary')};
  border: none;
  color: ${getColor('contrast')};
`
