import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { PageCheckIcon } from '@lib/ui/icons/PageCheckIcon'
import { DropZoneContainer } from '@lib/ui/inputs/upload/DropZoneContainer'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

export const UploadedBackupFile = ({ value }: ValueProp<File>) => {
  return (
    <UploadedContainer>
      <IconContainer>
        <PageCheckIcon />
      </IconContainer>
      <Text color="primary" weight="600" size={14}>
        {value.name}
      </Text>
    </UploadedContainer>
  )
}

const UploadedContainer = styled(DropZoneContainer)`
  flex-direction: column;
  gap: 16px;
  border: 1px solid ${getColor('primary')};
  background: ${({ theme }) =>
    theme.colors.primary.getVariant({ a: () => 0.1 }).toCssValue()};
`

const IconContainer = styled(IconWrapper)`
  color: ${getColor('primary')};
  font-size: 60px;
`
