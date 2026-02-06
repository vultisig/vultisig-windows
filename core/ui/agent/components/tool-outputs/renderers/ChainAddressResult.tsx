import { Chain } from '@core/chain/Chain'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC } from 'react'
import styled from 'styled-components'

import { ChainIcon } from '../ChainIcon'
import { CopyButton } from '../CopyButton'
import { ExplorerLink } from '../ExplorerLink'

type ChainAddressData = {
  chain?: string
  address?: string
  found?: boolean
  message?: string
}

type Props = {
  data: unknown
}

const isChainAddressData = (data: unknown): data is ChainAddressData => {
  if (typeof data !== 'object' || data === null) return false
  return true
}

const getChainFromString = (chainStr: string): Chain | null => {
  const chainValues = Object.values(Chain)
  const found = chainValues.find(
    c => c.toLowerCase() === chainStr.toLowerCase()
  )
  return found ?? null
}

export const ChainAddressResult: FC<Props> = ({ data }) => {
  if (!isChainAddressData(data)) {
    return null
  }

  if (data.found === false) {
    return (
      <Container>
        <Text size={13} color="warning">
          {data.message || 'Address not found for that chain.'}
        </Text>
      </Container>
    )
  }

  if (!data.chain || !data.address) {
    return null
  }

  const chain = getChainFromString(data.chain)
  if (!chain) {
    return null
  }

  return (
    <Container>
      <VStack gap={12}>
        <HStack gap={8} alignItems="center">
          <ChainIcon chain={chain} size={20} />
          <Text size={14} weight={600} color="regular">
            {data.chain}
          </Text>
        </HStack>
        <AddressContainer>
          <Text family="mono" size={13} color="supporting" weight={500}>
            {data.address}
          </Text>
          <HStack gap={4}>
            <CopyButton value={data.address} label="Address copied" />
            <ExplorerLink chain={chain} entity="address" value={data.address} />
          </HStack>
        </AddressContainer>
      </VStack>
    </Container>
  )
}

const Container = styled.div`
  padding: 12px 16px;
  background: ${getColor('foreground')};
  border-radius: 8px;
  border: 1px solid ${getColor('mist')};
`

const AddressContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px;
  background: ${getColor('background')};
  border-radius: 6px;
`
