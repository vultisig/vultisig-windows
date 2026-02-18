import { getBlockExplorerUrl } from '@core/chain/utils/getBlockExplorerUrl'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { formatAmount } from '@lib/utils/formatAmount'
import { FC } from 'react'
import styled from 'styled-components'

import { truncateAddress } from '../../tools/shared/assetResolution'
import { CopyableValue } from '../shared/CopyableValue'
import { ExplorerLink } from '../shared/ExplorerLink'
import { ResolvedTokenInfo } from './resolveSwapTokenInfo'

type Props = {
  info: ResolvedTokenInfo
  coinIcon: {
    chain: ResolvedTokenInfo['chain']
    id?: string
    logo: string
  } | null
  amount: string
  usdValue: number | null
  subAmount?: string
  balance?: number | null
  verified?: boolean
}

export const TokenRow: FC<Props> = ({
  info,
  coinIcon,
  amount,
  usdValue,
  subAmount,
  balance,
  verified,
}) => {
  const explorerUrl = info.contractAddress
    ? info.chain
      ? getBlockExplorerUrl({
          chain: info.chain,
          entity: 'address',
          value: info.contractAddress,
        })
      : null
    : null

  return (
    <HStack gap={12} alignItems="center" justifyContent="space-between">
      <HStack gap={12} alignItems="center" style={{ flex: 1, minWidth: 0 }}>
        {coinIcon && coinIcon.chain ? (
          <CoinIcon
            coin={{
              chain: coinIcon.chain,
              id: coinIcon.id,
              logo: coinIcon.logo,
            }}
            style={{ fontSize: 32 }}
          />
        ) : (
          <ChainEntityIcon style={{ fontSize: 32 }} />
        )}
        <VStack gap={2} style={{ minWidth: 0 }}>
          <HStack gap={6} alignItems="center">
            <Text size={15} weight={600}>
              {info.ticker}
            </Text>
            <Text size={12} color="supporting">
              {info.chain ?? info.ticker}
            </Text>
            {verified !== undefined && (
              <VerificationBadge $verified={verified}>
                <Text size={10}>{verified ? 'verified' : 'unverified'}</Text>
              </VerificationBadge>
            )}
          </HStack>
          {info.contractAddress ? (
            explorerUrl ? (
              <ExplorerLink
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {truncateAddress(info.contractAddress)} &#x2197;
              </ExplorerLink>
            ) : (
              <CopyableValue value={info.contractAddress} />
            )
          ) : (
            <Text size={11} color="supporting">
              Native
            </Text>
          )}
          <Text size={11} color="supporting">
            Decimals: {info.decimals}
          </Text>
          {balance !== undefined && balance !== null && (
            <Text size={11} color="supporting">
              Balance: {formatAmount(balance)} {info.ticker}
            </Text>
          )}
        </VStack>
      </HStack>
      <VStack gap={2} alignItems="end" style={{ flexShrink: 0 }}>
        <Text size={14} weight={500}>
          {amount}
        </Text>
        {usdValue !== null && (
          <Text size={12} color="supporting">
            {formatAmount(usdValue, { currency: 'usd' })}
          </Text>
        )}
        {subAmount && (
          <Text size={11} color="shy">
            {subAmount}
          </Text>
        )}
      </VStack>
    </HStack>
  )
}

const VerificationBadge = styled.div<{ $verified: boolean }>`
  padding: 1px 6px;
  border-radius: 4px;
  background: ${({ $verified }) =>
    $verified ? 'rgba(0, 200, 83, 0.12)' : 'rgba(255, 171, 0, 0.12)'};
  color: ${({ $verified }) =>
    $verified ? 'rgb(0, 200, 83)' : 'rgb(255, 171, 0)'};
`
