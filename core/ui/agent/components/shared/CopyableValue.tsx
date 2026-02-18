import { CopyIcon } from '@lib/ui/icons/CopyIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { FC } from 'react'

import { truncateAddress } from '../../tools/shared/assetResolution'
import { CopyButton } from './CopyButton'

type Props = {
  value: string
  display?: string
}

export const CopyableValue: FC<Props> = ({ value, display }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(value)
  }

  return (
    <HStack gap={4} alignItems="center">
      <Text family="mono" size={12} color="supporting">
        {display ?? truncateAddress(value)}
      </Text>
      <CopyButton onClick={handleCopy}>
        <CopyIcon />
      </CopyButton>
    </HStack>
  )
}
