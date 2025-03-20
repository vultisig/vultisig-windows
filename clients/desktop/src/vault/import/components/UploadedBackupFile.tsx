import { ValueProp } from '@lib/ui/props'
import styled from 'styled-components'

import { PageCheckIcon } from '../../../lib/ui/icons/PageCheckIcon'
import { DropZoneContainer } from '../../../lib/ui/inputs/upload/DropZoneContainer'
import { DropZoneContent } from '../../../lib/ui/inputs/upload/DropZoneContent'
import { Text } from '../../../lib/ui/text'
import { getColor } from '../../../lib/ui/theme/getters'

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
