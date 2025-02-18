import styled from 'styled-components'

import { IconButton } from '../../buttons/IconButton'
import { CloseIcon } from '../../icons/CloseIcon'
import { FileIcon } from '../../icons/FileIcon'
import { IconWrapper } from '../../icons/IconWrapper'
import { HStack } from '../../layout/Stack'
import { Text } from '../../text'
import { getColor } from '../../theme/getters'

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
