import { PageCheckIcon } from '@lib/ui/icons/PageCheckIcon'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

import { DropZoneContainer } from '../../../lib/ui/inputs/upload/DropZoneContainer'
import { DropZoneContent } from '../../../lib/ui/inputs/upload/DropZoneContent'

type UploadedBackupFileProps = ValueProp<File>

export const UploadedBackupFile = ({ value }: UploadedBackupFileProps) => {
  return (
    <>
      <SuccessfulUploadedContainer>
        <DropZoneContent icon={<PageCheckIcon />}>
          <Text color="primary">{value.name}</Text>
        </DropZoneContent>
      </SuccessfulUploadedContainer>
    </>
  )
}

const SuccessfulUploadedContainer = styled(DropZoneContainer)`
  border: 1px solid ${getColor('success')};
  background: ${({ theme }) =>
    theme.colors.success.getVariant({ a: () => 0.1 }).toCssValue()};
`
