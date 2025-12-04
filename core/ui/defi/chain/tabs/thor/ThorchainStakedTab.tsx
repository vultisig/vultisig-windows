import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import {
  useRujiStakeViewQuery,
  useThorMergedAssetsQuery,
  useThorTcyStakeQuery,
} from '@core/ui/defi/chain/thor/hooks'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Panel } from '@lib/ui/panel/Panel'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { formatAmount } from '@lib/utils/formatAmount'
import styled from 'styled-components'

const format8d = (value: bigint) =>
  formatAmount(fromChainAmount(value, 8), { precision: 'high' })

export const ThorchainStakedTab = () => {
  const {
    data: tcyStake,
    isPending: isTcyPending,
    isError: isTcyError,
  } = useThorTcyStakeQuery()
  const {
    data: mergedAssets,
    isPending: isMergedPending,
    isError: isMergedError,
  } = useThorMergedAssetsQuery()
  const { data: rujiStake } = useRujiStakeViewQuery()
  const navigate = useCoreNavigate()

  if (isTcyPending || isMergedPending) {
    return (
      <HStack justifyContent="center">
        <Spinner />
      </HStack>
    )
  }

  if (isTcyError || isMergedError) {
    return (
      <Text color="danger" size={14}>
        Failed to load stake data.
      </Text>
    )
  }

  const rujiPositions =
    mergedAssets?.filter(position =>
      position.symbol.toLowerCase().includes('ruji')
    ) ?? []

  return (
    <VStack gap={16}>
      <StakeCard as={Panel}>
        <VStack gap={6}>
          <Text size={12} color="shy">
            Staked TCY
          </Text>
          <Text size={22} weight="700">
            {format8d(tcyStake ?? 0n)} TCY
          </Text>
        </VStack>
        <Actions>
          <ActionButton
            onClick={() =>
              navigate({
                id: 'deposit',
                state: { coin: chainFeeCoin.THORChain, action: 'unstake' },
              })
            }
          >
            Unstake
          </ActionButton>
          <PrimaryAction
            onClick={() =>
              navigate({
                id: 'deposit',
                state: { coin: chainFeeCoin.THORChain, action: 'stake' },
              })
            }
          >
            Stake
          </PrimaryAction>
        </Actions>
      </StakeCard>

      {rujiPositions.map(position => {
        const positionAmount = BigInt(position.sizeAmountChain ?? '0')
        return (
          <StakeCard as={Panel} key={position.symbol}>
            <VStack gap={6}>
              <Text size={12} color="shy">
                {position.symbol.toUpperCase()}
              </Text>
              <Text size={22} weight="700">
                {format8d(positionAmount)} {position.symbol.toUpperCase()}
              </Text>
              <Text size={12} color="shy">
                Shares: {position.sharesChain}
              </Text>
            </VStack>
            <Actions>
              <ActionButton
                onClick={() =>
                  navigate({
                    id: 'deposit',
                    state: { coin: chainFeeCoin.THORChain, action: 'unstake' },
                  })
                }
              >
                Unstake
              </ActionButton>
              <PrimaryAction
                onClick={() =>
                  navigate({
                    id: 'deposit',
                    state: { coin: chainFeeCoin.THORChain, action: 'stake' },
                  })
                }
              >
                Stake
              </PrimaryAction>
            </Actions>
          </StakeCard>
        )
      })}

      {rujiPositions.length === 0 && (
        <Panel>
          <Text size={14} color="shy">
            No RUJI positions detected.
          </Text>
        </Panel>
      )}

      {rujiStake && BigInt(rujiStake.rewardsAmount ?? '0') > 0n && (
        <Panel>
          <HStack justifyContent="space-between" alignItems="center">
            <VStack gap={4}>
              <Text size={12} color="shy">
                Pending rewards
              </Text>
              <Text size={18} weight="700">
                {format8d(BigInt(rujiStake.rewardsAmount ?? '0'))}{' '}
                {rujiStake.rewardsTicker}
              </Text>
            </VStack>
            <PrimaryAction
              onClick={() =>
                navigate({
                  id: 'deposit',
                  state: {
                    coin: chainFeeCoin.THORChain,
                    action: 'withdraw_ruji_rewards',
                  },
                })
              }
            >
              Withdraw
            </PrimaryAction>
          </HStack>
        </Panel>
      )}
    </VStack>
  )
}

const StakeCard = styled(Panel)`
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
