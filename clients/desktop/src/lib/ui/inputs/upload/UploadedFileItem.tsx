import { IconButton } from '@lib/ui/buttons/IconButton'
import { CloseIcon } from '@lib/ui/icons/CloseIcon'
import { FileIcon } from '@lib/ui/icons/FileIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

const IconContainer = styled(IconWrapper)`
  color: ${getColor('primary')};
  font-size: 20px;
`

interface UploadedFileItemProps {
  fileName: string
  onRemove: () => void
}

export const UploadedFileItem = ({
  fileName,
  onRemove,
}: UploadedFileItemProps) => {
  return (
    <HStack alignItems="center" justifyContent="space-between">
      <HStack gap={8} alignItems="center">
        <IconContainer>
          <FileIcon />
        </IconContainer>
        <Text color="regular">{fileName}</Text>
      </HStack>
      <IconButton icon={<CloseIcon />} title="Remove" onClick={onRemove} />
    </HStack>
  )
}
