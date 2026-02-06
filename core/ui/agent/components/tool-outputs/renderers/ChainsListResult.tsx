import { Chain } from '@core/chain/Chain'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { MiddleTruncate } from '@lib/ui/truncate'
import { FC } from 'react'

import { ChainIcon } from '../ChainIcon'
import { CopyButton } from '../CopyButton'
import { ExplorerLink } from '../ExplorerLink'
import { ResultPanel } from '../ResultPanel'
import { ResultRow } from '../ResultRow'

type ChainAddressItem = {
  chain: string
  address: string
}

type ChainsListData = {
  chains?: ChainAddressItem[]
}

type Props = {
  data: unknown
}

const isChainsListData = (data: unknown): data is ChainsListData => {
  if (typeof data !== 'object' || data === null) return false
  const obj = data as Record<string, unknown>
  if (!Array.isArray(obj.chains)) return false
  return obj.chains.every(
    (item: unknown) =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as ChainAddressItem).chain === 'string' &&
      typeof (item as ChainAddressItem).address === 'string'
  )
}

const getChainFromString = (chainStr: string): Chain | null => {
  const chainValues = Object.values(Chain)
  const found = chainValues.find(
    c => c.toLowerCase() === chainStr.toLowerCase()
  )
  return found ?? null
}

export const ChainsListResult: FC<Props> = ({ data }) => {
  if (!isChainsListData(data) || !data.chains) {
    return null
  }

  return (
    <ResultPanel title="Your Chains" count={data.chains.length}>
      {data.chains.map((item, index) => {
        const chain = getChainFromString(item.chain)
        return (
          <ResultRow
            key={index}
            icon={chain ? <ChainIcon chain={chain} size={24} /> : undefined}
            extra={
              chain && (
                <HStack gap={4}>
                  <CopyButton value={item.address} label="Address copied" />
                  <ExplorerLink
                    chain={chain}
                    entity="address"
                    value={item.address}
                  />
                </HStack>
              )
            }
          >
            <HStack gap={8} alignItems="center" fullWidth>
              <Text size={14} weight={500} color="regular">
                {item.chain}
              </Text>
              <MiddleTruncate
                text={item.address}
                color="textSupporting"
                size={13}
                flexGrow
              />
            </HStack>
          </ResultRow>
        )
      })}
    </ResultPanel>
  )
}
