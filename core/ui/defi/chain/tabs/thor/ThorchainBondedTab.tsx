import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { getCoinLogoSrc } from '@core/ui/chain/coin/icon/utils/getCoinLogoSrc'
import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { useThorBondedNodesQuery } from '@core/ui/defi/chain/thor/hooks'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { ArrowUpRightIcon } from '@lib/ui/icons/ArrowUpRightIcon'
import { ChevronDownIcon } from '@lib/ui/icons/ChevronDownIcon'
import { SafeImage } from '@lib/ui/images/SafeImage'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Panel } from '@lib/ui/panel/Panel'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { formatAmount } from '@lib/utils/formatAmount'
import { useState } from 'react'
import styled from 'styled-components'

const runeDecimals = 8

const formatRune = (amount: bigint) =>
  formatAmount(fromChainAmount(amount, runeDecimals), { precision: 'high' })

const formatUsd = (value: number) =>
  `$${formatAmount(value, { precision: 'high' })}`

const truncateAddress = (address: string) => {
  if (address.length <= 16) return address
  return `${address.slice(0, 8)}...${address.slice(-6)}`
}

export const ThorchainBondedTab = () => {
  const { data, isPending, isError } = useThorBondedNodesQuery()
  const navigate = useCoreNavigate()
  const [activeNodesExpanded, setActiveNodesExpanded] = useState(true)
  const [availableNodesExpanded, setAvailableNodesExpanded] = useState(true)

  const runeCoin = chainFeeCoin.THORChain
  const pricesQuery = useCoinPricesQuery({
    coins: [
      {
        chain: Chain.THORChain,
        id: runeCoin.id,
        priceProviderId: runeCoin.priceProviderId,
      },
    ],
  })
  const runePrice = pricesQuery.data?.[`${Chain.THORChain}:`] ?? 0

  const totalBond = (data ?? []).reduce(
    (sum, node) => sum + BigInt(node.bond ?? '0'),
    0n
  )
  const totalBondUsd = fromChainAmount(totalBond, runeDecimals) * runePrice

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

  const activeNodes = data ?? []

  return (
    <VStack gap={16}>
      {/* Total Bonded RUNE Card */}
      <BondedCard>
        <HStack gap={12} alignItems="center">
          <SafeImage
            src={getCoinLogoSrc('rune')}
            render={props => <RuneIcon {...props} />}
            fallback={<RuneIconFallback>R</RuneIconFallback>}
          />
          <VStack gap={4}>
            <Text size={12} color="shy">
              Total Bonded RUNE
            </Text>
            <Text size={22} weight="700" color="contrast">
              {formatRune(totalBond)} RUNE
            </Text>
            <Text size={12} color="shy">
              {formatUsd(totalBondUsd)}
            </Text>
          </VStack>
        </HStack>
      </BondedCard>

      {/* Bond to Node Button */}
      <BondToNodeButton
        onClick={() =>
          navigate({
            id: 'deposit',
            state: { coin: chainFeeCoin.THORChain },
          })
        }
      >
        Bond to Node
      </BondToNodeButton>

      {/* Active Nodes Section */}
      {activeNodes.length > 0 && (
        <SectionPanel>
          <SectionHeader
            onClick={() => setActiveNodesExpanded(!activeNodesExpanded)}
          >
            <Text size={14} weight="600" color="contrast">
              Active Nodes
            </Text>
            <ChevronIcon>
              <ChevronDownIcon
                style={{
                  transform: activeNodesExpanded ? 'rotate(180deg)' : 'none',
                }}
              />
            </ChevronIcon>
          </SectionHeader>
          {activeNodesExpanded && (
            <VStack gap={16} style={{ padding: 16 }}>
              {activeNodes.map(node => {
                const bondAmount = BigInt(node.bond ?? '0')
                const bondUsd =
                  fromChainAmount(bondAmount, runeDecimals) * runePrice
                const isChurnedOut = node.status?.toLowerCase() !== 'active'

                return (
                  <NodeCard key={node.address}>
                    {/* Node Address Row */}
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text size={12} color="shy">
                        Node Address: {truncateAddress(node.address)}
                      </Text>
                      <StatusBadge isActive={!isChurnedOut}>
                        {isChurnedOut ? 'Churned Out' : 'Active'}
                      </StatusBadge>
                    </HStack>

                    {/* Bonded Amount Row */}
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text size={14} weight="600" color="primary">
                        Bonded: {formatRune(bondAmount)} RUNE
                      </Text>
                      <Text size={14} color="contrast">
                        {formatUsd(bondUsd)}
                      </Text>
                    </HStack>

                    {/* APY Row */}
                    <HStack justifyContent="space-between" alignItems="center">
                      <HStack gap={6} alignItems="center">
                        <InfoIcon>@</InfoIcon>
                        <Text size={12} color="shy">
                          APY
                        </Text>
                      </HStack>
                      <Text size={12} weight="600" color="primary">
                        0 %
                      </Text>
                    </HStack>

                    {/* Next Churn Row */}
                    <HStack justifyContent="space-between" alignItems="center">
                      <HStack gap={6} alignItems="center">
                        <InfoIcon>📅</InfoIcon>
                        <Text size={12} color="shy">
                          Next Churn
                        </Text>
                      </HStack>
                      <Text size={12} color="contrast">
                        --
                      </Text>
                    </HStack>

                    {/* Next Award Row */}
                    <HStack justifyContent="space-between" alignItems="center">
                      <HStack gap={6} alignItems="center">
                        <InfoIcon>📅</InfoIcon>
                        <Text size={12} color="shy">
                          Next award
                        </Text>
                      </HStack>
                      <Text size={12} color="contrast">
                        -- RUNE
                      </Text>
                    </HStack>

                    {/* Action Buttons */}
                    <HStack gap={10}>
                      <ActionButton
                        onClick={() =>
                          navigate({
                            id: 'deposit',
                            state: {
                              coin: chainFeeCoin.THORChain,
                              action: 'unbond',
                            },
                          })
                        }
                      >
                        <ButtonIcon>↩</ButtonIcon>
                        Unbond
                      </ActionButton>
                      <PrimaryActionButton
                        onClick={() =>
                          navigate({
                            id: 'deposit',
                            state: {
                              coin: chainFeeCoin.THORChain,
                              action: 'bond',
                            },
                          })
                        }
                      >
                        <ButtonIcon>🔗</ButtonIcon>
                        Bond
                      </PrimaryActionButton>
                    </HStack>

                    {isChurnedOut && (
                      <Text size={11} color="shy">
                        Wait until Node is churned out
                      </Text>
                    )}
                  </NodeCard>
                )
              })}
            </VStack>
          )}
        </SectionPanel>
      )}

      {/* Available Nodes Section */}
      <SectionPanel>
        <SectionHeader
          onClick={() => setAvailableNodesExpanded(!availableNodesExpanded)}
        >
          <Text size={14} weight="600" color="contrast">
            Available Nodes
          </Text>
          <ChevronIcon>
            <ChevronDownIcon
              style={{
                transform: availableNodesExpanded ? 'rotate(180deg)' : 'none',
              }}
            />
          </ChevronIcon>
        </SectionHeader>
        {availableNodesExpanded && (
          <VStack gap={12} style={{ padding: 16 }}>
            {/* Example available node - in real app this would come from API */}
            <VStack gap={12}>
              <HStack justifyContent="space-between" alignItems="center">
                <Text size={14} color="contrast">
                  VultiNode: thor1caywxyz
                </Text>
                <Text size={12} weight="600" color="primary">
                  Active
                </Text>
              </HStack>
              <RequestToBondButton>
                <ArrowUpRightIcon />
                Request to Bond
              </RequestToBondButton>
            </VStack>
          </VStack>
        )}
      </SectionPanel>
    </VStack>
  )
}

const BondedCard = styled(Panel)`
  padding: 16px;
`

const RuneIcon = styled.img`
  ${sameDimensions(40)};
  border-radius: 50%;
`

const RuneIconFallback = styled.div`
  ${sameDimensions(40)};
  border-radius: 50%;
  background: ${getColor('foregroundExtra')};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${getColor('primary')};
  font-weight: 700;
`

const BondToNodeButton = styled.button`
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 12px;
  background: ${getColor('buttonPrimary')};
  color: ${getColor('contrast')};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
`

const SectionPanel = styled(Panel)`
  overflow: hidden;
`

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  cursor: pointer;
  border-bottom: 1px solid ${getColor('foregroundExtra')};
`

const ChevronIcon = styled.div`
  color: ${getColor('textShy')};
  display: flex;
  align-items: center;

  svg {
    width: 16px;
    height: 16px;
  }
`

const NodeCard = styled(VStack)`
  gap: 10px;
  padding-bottom: 16px;
  border-bottom: 1px solid ${getColor('foregroundExtra')};

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`

const StatusBadge = styled.span<{ isActive: boolean }>`
  font-size: 12px;
  font-weight: 600;
  color: ${({ isActive }) =>
    isActive ? getColor('primary') : getColor('danger')};
`

const InfoIcon = styled.span`
  font-size: 12px;
  opacity: 0.6;
`

const ActionButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 14px;
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 20px;
  background: transparent;
  color: ${getColor('contrast')};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
`

const PrimaryActionButton = styled(ActionButton)`
  background: ${getColor('buttonPrimary')};
  border-color: ${getColor('buttonPrimary')};
`

const ButtonIcon = styled.span`
  font-size: 14px;
`

const RequestToBondButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 20px;
  background: transparent;
  color: ${getColor('contrast')};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  svg {
    width: 16px;
    height: 16px;
  }
`
