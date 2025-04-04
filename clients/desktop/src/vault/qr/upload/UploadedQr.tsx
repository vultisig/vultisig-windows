import { ContainImage } from '@lib/ui/images/ContainImage'
import { VStack } from '@lib/ui/layout/Stack'
import { OnRemoveProp, ValueProp } from '@lib/ui/props'

import { DropZoneContainer } from '../../../lib/ui/inputs/upload/DropZoneContainer'
import { UploadedFileItem } from '../../../lib/ui/inputs/upload/UploadedFileItem'

type UploadQrProps = ValueProp<File> & OnRemoveProp

export const UploadedQr = ({ value, onRemove }: UploadQrProps) => {
  return (
    <VStack fullWidth flexGrow gap={20}>
      <DropZoneContainer>
        <ContainImage src={URL.createObjectURL(value)} alt="Uploaded QR Code" />
      </DropZoneContainer>
      <UploadedFileItem fileName={value.name} onRemove={onRemove} />
    </VStack>
  )
}
