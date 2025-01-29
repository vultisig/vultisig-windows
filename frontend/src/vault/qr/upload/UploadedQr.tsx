import { ContainImage } from '../../../lib/ui/images/ContainImage';
import { DropZoneContainer } from '../../../lib/ui/inputs/upload/DropZoneContainer';
import { UploadedFileItem } from '../../../lib/ui/inputs/upload/UploadedFileItem';
import { VStack } from '../../../lib/ui/layout/Stack';
import {
  ComponentWithValueProps,
  RemovableComponentProps,
} from '../../../lib/ui/props';

type UploadQrProps = ComponentWithValueProps<File> & RemovableComponentProps;

export const UploadedQr = ({ value, onRemove }: UploadQrProps) => {
  return (
    <VStack fullWidth flexGrow gap={20}>
      <DropZoneContainer>
        <ContainImage src={URL.createObjectURL(value)} alt="Uploaded QR Code" />
      </DropZoneContainer>
      <UploadedFileItem fileName={value.name} onRemove={onRemove} />
    </VStack>
  );
};
