import { Chain } from '@core/chain/Chain'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { MiddleTruncate } from '@lib/ui/truncate'
import { FC } from 'react'

import { CopyButton } from './CopyButton'
import { ExplorerLink } from './ExplorerLink'

type AddressDisplayProps = {
  address: string
  chain: Chain
  truncate?: boolean
}

export const AddressDisplay: FC<AddressDisplayProps> = ({
  address,
  chain,
  truncate = false,
}) => {
  return (
    <HStack gap={8} alignItems="center" justifyContent="space-between">
      {truncate ? (
        <MiddleTruncate
          text={address}
          color="textSupporting"
          size={13}
          weight={500}
        />
      ) : (
        <Text family="mono" size={13} color="supporting" weight={500}>
          {address}
        </Text>
      )}
      <HStack gap={4} alignItems="center">
        <CopyButton value={address} label="Address copied" />
        <ExplorerLink chain={chain} entity="address" value={address} />
      </HStack>
    </HStack>
  )
}
