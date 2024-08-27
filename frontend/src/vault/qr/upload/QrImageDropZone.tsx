import { useDropzone } from 'react-dropzone';
import { QrImageDropZoneContainer } from './QrImageDropZoneContainer';
import styled from 'styled-components';
import { interactive } from '../../../lib/ui/css/interactive';
import { VStack } from '../../../lib/ui/layout/Stack';
import { getColor } from '../../../lib/ui/theme/getters';
import { ComputerUploadIcon } from '../../../lib/ui/icons/ComputerUploadIcon';
import { Text } from '../../../lib/ui/text';
import { IconWrapper } from '../../../lib/ui/icons/IconWrapper';

type QrImageDropZoneProps = {
  onFinish: (data: File) => void;
};

const Container = styled(QrImageDropZoneContainer)`
  ${interactive};

  &:hover {
    background: ${({ theme }) =>
      theme.colors.primary.getVariant({ a: () => 0.2 }).toCssValue()};
  }
`;

const IconContainer = styled(IconWrapper)`
  color: ${getColor('primary')};
  font-size: 60px;
`;

export const QrImageDropZone = ({ onFinish }: QrImageDropZoneProps) => {
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/bmp': ['.bmp'],
      'image/webp': ['.webp'],
      'image/tiff': ['.tiff', '.tif'],
      'image/svg+xml': ['.svg'],
    },
    onDrop: acceptedFiles => {
      const [file] = acceptedFiles;
      if (file) {
        onFinish(file);
      }
    },
  });

  return (
    <Container {...getRootProps()}>
      <VStack gap={8} alignItems="center">
        <IconContainer>
          <ComputerUploadIcon />
        </IconContainer>
        <Text color="regular" weight="600" size={14}>
          Upload QR-Code Image
        </Text>
      </VStack>
      <input {...getInputProps()} />
    </Container>
  );
};
