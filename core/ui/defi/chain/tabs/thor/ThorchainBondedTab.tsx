import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { useThorBondedNodesQuery } from '@core/ui/defi/chain/thor/hooks'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Panel } from '@lib/ui/panel/Panel'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { formatAmount } from '@lib/utils/formatAmount'
import styled from 'styled-components'

const formatRune = (amount: bigint) =>
  formatAmount(fromChainAmount(amount, 8), { precision: 'high' })

export const ThorchainBondedTab = () => {
  const { data, isPending, isError } = useThorBondedNodesQuery()
  const navigate = useCoreNavigate()

  const totalBond = (data ?? []).reduce(
    (sum, node) => sum + BigInt(node.bond ?? '0'),
    0n
  )

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
        Failed to load bonded nodes.
      </Text>
    )
  }

  return (
    <VStack gap={16}>
      <Panel>
        <VStack gap={8}>
          <Text size={12} color="shy">
            Total Bonded RUNE
          </Text>
          <HStack justifyContent="space-between" alignItems="center">
            <Text size={24} weight="700">
              {formatRune(totalBond)} RUNE
            </Text>
            <BondButton
              onClick={() =>
                navigate({
                  id: 'deposit',
                  state: { coin: chainFeeCoin.THORChain },
                })
              }
            >
              Bond to Node
            </BondButton>
          </HStack>
        </VStack>
      </Panel>

      <Panel withSections>
        <SectionHeader>
          <Text size={14} weight="600">
            Active Nodes
          </Text>
          <Text size={12} color="shy">
            {data?.length ?? 0}
          </Text>
        </SectionHeader>
        <VStack gap={12} padding={16}>
          {(data ?? []).map(node => (
            <NodeRow key={node.address}>
              <VStack gap={4}>
                <Text size={14} weight="600">
                  {node.address}
                </Text>
                <Text size={12} color="shy">
                  Bonded: {formatRune(BigInt(node.bond ?? '0'))} RUNE
                </Text>
              </VStack>
              <HStack gap={8}>
                <ActionButton
                  onClick={() =>
                    navigate({
                      id: 'deposit',
                      state: { coin: chainFeeCoin.THORChain, action: 'unbond' },
                    })
                  }
                >
                  Unbond
                </ActionButton>
                <PrimaryAction
                  onClick={() =>
                    navigate({
                      id: 'deposit',
                      state: { coin: chainFeeCoin.THORChain, action: 'bond' },
                    })
                  }
                >
                  Bond
                </PrimaryAction>
              </HStack>
              <Status status={node.status}>{node.status}</Status>
            </NodeRow>
          ))}
          {(data ?? []).length === 0 && (
            <Text size={14} color="shy">
              No bonded nodes found for this address.
            </Text>
          )}
        </VStack>
      </Panel>
    </VStack>
  )
}

const BondButton = styled.button`
  border: none;
  outline: none;
  padding: 10px 16px;
  border-radius: 12px;
  background: ${getColor('buttonPrimary')};
  color: ${getColor('contrast')};
  cursor: pointer;
  font-weight: 600;
`

const ActionButton = styled.button`
  border: 1px solid ${getColor('foregroundExtra')};
  background: transparent;
  color: ${getColor('contrast')};
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
`

const PrimaryAction = styled(ActionButton)`
  background: ${getColor('buttonPrimary')};
  border: none;
  color: ${getColor('contrast')};
`

const SectionHeader = styled(HStack)`
  padding: 12px 16px;
  border-bottom: 1px solid ${getColor('foregroundExtra')};
  justify-content: space-between;
  align-items: center;
`

const NodeRow = styled(HStack)`
  justify-content: space-between;
  align-items: center;
`

const Status = styled.span<{ status: string }>`
  font-size: 12px;
  font-weight: 600;
  color: ${({ status }) =>
    status?.toLowerCase() === 'active'
      ? getColor('success')
      : getColor('textShy')};
`
