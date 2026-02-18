import { Chain } from '@core/chain/Chain'
import { getBlockExplorerUrl } from '@core/chain/utils/getBlockExplorerUrl'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { FC } from 'react'

import { truncateAddress } from '../../tools/shared/assetResolution'
import { CopyableValue } from './CopyableValue'
import { ExplorerLink } from './ExplorerLink'
import { SelfBadge } from './SelfBadge'

type Props = {
  address: string
  chain: Chain | null
  selfAddress?: string
}

export const AddressValue: FC<Props> = ({ address, chain, selfAddress }) => {
  const isSelf =
    selfAddress && address.toLowerCase() === selfAddress.toLowerCase()
  const url = chain
    ? getBlockExplorerUrl({ chain, entity: 'address', value: address })
    : null

  if (url) {
    return (
      <HStack gap={4} alignItems="center">
        <ExplorerLink href={url} target="_blank" rel="noopener noreferrer">
          {truncateAddress(address)} &#x2197;
        </ExplorerLink>
        {isSelf && (
          <SelfBadge>
            <Text size={10}>(SELF)</Text>
          </SelfBadge>
        )}
      </HStack>
    )
  }

  return (
    <HStack gap={4} alignItems="center">
      <CopyableValue value={address} />
      {isSelf && (
        <SelfBadge>
          <Text size={10}>(SELF)</Text>
        </SelfBadge>
      )}
    </HStack>
  )
}
