import styled from 'styled-components';

import { IconButton } from '../../../lib/ui/buttons/IconButton';
import { CloseIcon } from '../../../lib/ui/icons/CloseIcon';
import { FileIcon } from '../../../lib/ui/icons/FileIcon';
import { IconWrapper } from '../../../lib/ui/icons/IconWrapper';
import { ContainImage } from '../../../lib/ui/images/ContainImage';
import { HStack, VStack } from '../../../lib/ui/layout/Stack';
import {
  ComponentWithValueProps,
  RemovableComponentProps,
} from '../../../lib/ui/props';
import { Text } from '../../../lib/ui/text';
import { getColor } from '../../../lib/ui/theme/getters';
import { QrImageDropZoneContainer } from './QrImageDropZoneContainer';

type UploadQrProps = ComponentWithValueProps<File> & RemovableComponentProps;

const IconContainer = styled(IconWrapper)`
  color: ${getColor('primary')};
  font-size: 20px;
`;

export const UploadedQr = ({ value, onRemove }: UploadQrProps) => {
  return (
    <VStack fullWidth flexGrow gap={20}>
      <QrImageDropZoneContainer>
        <ContainImage src={URL.createObjectURL(value)} alt="Uploaded QR Code" />
      </QrImageDropZoneContainer>
      <HStack alignItems="center" justifyContent="space-between">
        <HStack gap={8} alignItems="center">
          <IconContainer>
            <FileIcon />
          </IconContainer>
          <Text color="regular">{value.name}</Text>
        </HStack>
        <IconButton icon={<CloseIcon />} title="Remove" onClick={onRemove} />
      </HStack>
    </VStack>
  );
};
