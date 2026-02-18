import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { getEvmContractCallInfo } from '@core/chain/chains/evm/contract/call/info'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { ChevronDownIcon } from '@lib/ui/icons/ChevronDownIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { formatAmount } from '@lib/utils/formatAmount'
import { useQuery } from '@tanstack/react-query'
import { FC, useState } from 'react'
import styled from 'styled-components'

import { TxData } from '../../types'
import { AddressValue } from '../shared/AddressValue'
import { CopyableValue } from '../shared/CopyableValue'
import { DetailRow } from '../shared/DetailRow'
import { DecodedCalldata } from './DecodedCalldata'

type Props = {
  tx: TxData
  chain: string
  sender: string
  label: string
  defaultExpanded?: boolean
  tokenDecimals?: number
}

export const TransactionDetailsSection: FC<Props> = ({
  tx,
  chain,
  sender,
  label,
  defaultExpanded = false,
  tokenDecimals,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded)

  const resolvedChain = chain as Chain | null

  const normalizeHex = (hex: string) =>
    hex.startsWith('0x') ? hex : `0x${hex}`

  const txDataHex = tx.data ? normalizeHex(tx.data) : ''

  const calldataQuery = useQuery({
    queryKey: ['txCalldata', label, txDataHex.slice(0, 10)],
    queryFn: () => getEvmContractCallInfo(txDataHex),
    enabled: txDataHex.length >= 10,
  })

  const formatTxValue = (value: string): string => {
    if (!value || value === '0') return '0'
    const decimals = resolvedChain ? chainFeeCoin[resolvedChain].decimals : 18
    const ticker = resolvedChain ? chainFeeCoin[resolvedChain].ticker : ''
    const num = fromChainAmount(value, decimals)
    return formatAmount(num, { ticker })
  }

  return (
    <>
      <ExpandButton onClick={() => setExpanded(prev => !prev)}>
        <HStack
          alignItems="center"
          justifyContent="space-between"
          style={{ width: '100%' }}
        >
          <Text size={13} weight={500}>
            {label} Details
          </Text>
          <RotatingChevron $expanded={expanded} />
        </HStack>
      </ExpandButton>
      {expanded && (
        <DetailsContainer>
          <DetailRow style={{ padding: '4px 0' }}>
            <Text size={12} color="supporting">
              To
            </Text>
            <AddressValue
              address={tx.to}
              chain={resolvedChain}
              selfAddress={sender}
            />
          </DetailRow>
          <DetailRow style={{ padding: '4px 0' }}>
            <Text size={12} color="supporting">
              Value (
              {resolvedChain ? chainFeeCoin[resolvedChain].ticker : 'ETH'})
            </Text>
            <Text size={12} weight={500}>
              {formatTxValue(tx.value)}
            </Text>
          </DetailRow>
          <DetailRow style={{ padding: '4px 0' }}>
            <Text size={12} color="supporting">
              Nonce
            </Text>
            <Text size={12} weight={500}>
              {tx.nonce}
            </Text>
          </DetailRow>
          <DetailRow style={{ padding: '4px 0' }}>
            <Text size={12} color="supporting">
              Gas Limit
            </Text>
            <Text size={12} weight={500}>
              {tx.gas_limit.toLocaleString()}
            </Text>
          </DetailRow>
          {tx.chain_id && (
            <DetailRow style={{ padding: '4px 0' }}>
              <Text size={12} color="supporting">
                Chain ID
              </Text>
              <Text size={12} weight={500}>
                {tx.chain_id}
              </Text>
            </DetailRow>
          )}
          {tx.memo && (
            <DetailRow style={{ padding: '4px 0' }}>
              <Text size={12} color="supporting">
                Memo
              </Text>
              <CopyableValue value={tx.memo} />
            </DetailRow>
          )}
          <DecodedCalldata
            data={txDataHex}
            query={calldataQuery}
            label={label}
            tokenDecimals={tokenDecimals}
            chain={resolvedChain}
            selfAddress={sender}
          />
        </DetailsContainer>
      )}
    </>
  )
}

const DetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  border-radius: 8px;
  background: ${getColor('background')};
`

const ExpandButton = styled(UnstyledButton)`
  width: 100%;
  padding: 6px 12px;
  border-radius: 8px;
  background: ${getColor('background')};
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: ${getColor('foregroundExtra')};
  }
`

const RotatingChevron = styled(ChevronDownIcon)<{ $expanded: boolean }>`
  transition: transform 0.2s ease;
  transform: rotate(${({ $expanded }) => ($expanded ? '180deg' : '0deg')});
  font-size: 16px;
  color: ${getColor('textShy')};
`
