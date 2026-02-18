import { getBlockExplorerUrl } from '@core/chain/utils/getBlockExplorerUrl'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { CircleAlertIcon } from '@lib/ui/icons/CircleAlertIcon'
import { CircleCheckIcon } from '@lib/ui/icons/CircleCheckIcon'
import { CopyIcon } from '@lib/ui/icons/CopyIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC } from 'react'
import styled from 'styled-components'

import { TxStatusInfo } from '../types'
import { getChainFromString } from '../utils/getChainFromString'
import { agentCard } from './shared/agentCard'
import { CopyButton } from './shared/CopyButton'
import { ExplorerLink } from './shared/ExplorerLink'

type TxStatusCardProps = {
  txStatus: TxStatusInfo
  onDismiss: () => void
}

const truncateHash = (hash: string) =>
  hash.length > 16 ? `${hash.slice(0, 8)}...${hash.slice(-6)}` : hash

export const TxStatusCard: FC<TxStatusCardProps> = ({
  txStatus,
  onDismiss,
}) => {
  const { txHash, chain, status, label } = txStatus

  const chainEnum = getChainFromString(chain)
  const explorerUrl = chainEnum
    ? getBlockExplorerUrl({ chain: chainEnum, entity: 'tx', value: txHash })
    : null

  const handleCopy = () => {
    navigator.clipboard.writeText(txHash)
  }

  return (
    <Card $status={status}>
      <HStack gap={12} alignItems="center">
        <IconWrapper $status={status}>
          {status === 'pending' && <Spinner size="1em" />}
          {status === 'confirmed' && <CircleCheckIcon />}
          {status === 'failed' && <CircleAlertIcon />}
        </IconWrapper>
        <VStack gap={4} style={{ flex: 1 }}>
          <Text size={14} weight={600}>
            {label} Transaction{' '}
            {status === 'pending'
              ? 'Pending'
              : status === 'confirmed'
                ? 'Confirmed'
                : 'Failed'}
          </Text>
          <HStack gap={8} alignItems="center">
            <Text size={12} color="supporting">
              {chain}
            </Text>
            <Text family="mono" size={12} color="supporting">
              {truncateHash(txHash)}
            </Text>
            <CopyButton onClick={handleCopy}>
              <CopyIcon />
            </CopyButton>
            {explorerUrl && (
              <ExplorerLink
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View &#x2197;
              </ExplorerLink>
            )}
          </HStack>
        </VStack>
        {status !== 'pending' && (
          <DismissButton onClick={onDismiss}>
            <Text size={12} color="supporting">
              Dismiss
            </Text>
          </DismissButton>
        )}
      </HStack>
    </Card>
  )
}

const Card = styled.div<{ $status: string }>`
  ${agentCard}
  border-color: ${({ $status }) => {
    switch ($status) {
      case 'confirmed':
        return getColor('primary')
      case 'failed':
        return getColor('danger')
      default:
        return getColor('mist')
    }
  }};
`

const IconWrapper = styled.div<{ $status: string }>`
  font-size: 20px;
  display: flex;
  align-items: center;
  color: ${({ $status }) => {
    switch ($status) {
      case 'confirmed':
        return getColor('primary')
      case 'failed':
        return getColor('danger')
      default:
        return getColor('textShy')
    }
  }};
`

const DismissButton = styled(UnstyledButton)`
  padding: 4px 8px;
  border-radius: 6px;
  &:hover {
    background: ${getColor('mist')};
  }
`
