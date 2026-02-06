import { Chain } from '@core/chain/Chain'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { MiddleTruncate } from '@lib/ui/truncate'
import { FC } from 'react'
import styled from 'styled-components'

import { ChainIcon } from '../ChainIcon'
import { CopyButton } from '../CopyButton'
import { ExplorerLink } from '../ExplorerLink'
import { ResultPanel } from '../ResultPanel'
import { ResultRow } from '../ResultRow'

type AddressBookEntry = {
  title: string
  chain: string
  address: string
}

type AddressBookData = {
  entries?: AddressBookEntry[]
}

type Props = {
  data: unknown
}

const isAddressBookData = (data: unknown): data is AddressBookData => {
  if (typeof data !== 'object' || data === null) return false
  const obj = data as Record<string, unknown>
  if (!Array.isArray(obj.entries)) return false
  return obj.entries.every(
    (item: unknown) =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as AddressBookEntry).title === 'string' &&
      typeof (item as AddressBookEntry).chain === 'string' &&
      typeof (item as AddressBookEntry).address === 'string'
  )
}

const getChainFromString = (chainStr: string): Chain | null => {
  const chainValues = Object.values(Chain)
  const found = chainValues.find(
    c => c.toLowerCase() === chainStr.toLowerCase()
  )
  return found ?? null
}

export const AddressBookResult: FC<Props> = ({ data }) => {
  if (!isAddressBookData(data) || !data.entries) {
    return null
  }

  return (
    <ResultPanel title="Address Book" count={data.entries.length}>
      {data.entries.map((entry, index) => {
        const chain = getChainFromString(entry.chain)

        return (
          <ResultRow
            key={index}
            icon={chain ? <ChainIcon chain={chain} size={24} /> : undefined}
            extra={
              chain && (
                <HStack gap={4}>
                  <CopyButton value={entry.address} label="Address copied" />
                  <ExplorerLink
                    chain={chain}
                    entity="address"
                    value={entry.address}
                  />
                </HStack>
              )
            }
          >
            <VStack gap={2}>
              <HStack gap={8} alignItems="center">
                <Text size={14} weight={500} color="regular">
                  {entry.title}
                </Text>
                <ChainBadge>
                  <Text size={11} color="supporting">
                    {entry.chain}
                  </Text>
                </ChainBadge>
              </HStack>
              <MiddleTruncate text={entry.address} color="textShy" size={12} />
            </VStack>
          </ResultRow>
        )
      })}
    </ResultPanel>
  )
}

const ChainBadge = styled.span`
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
`
