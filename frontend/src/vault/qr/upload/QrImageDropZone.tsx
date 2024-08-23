import { useDropzone } from 'react-dropzone';
import { QrImageDropZoneContainer } from './QrImageDropZoneContainer';
import styled from 'styled-components';
import { interactive } from '../../../lib/ui/css/interactive';

type QrImageDropZoneProps = {
  onFinish: (data: any) => void;
};

const Container = styled(QrImageDropZoneContainer)`
  ${interactive};

  &:hover {
    background: ${({ theme }) =>
      theme.colors.primary.getVariant({ a: () => 0.2 }).toCssValue()};
  }
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
      <input {...getInputProps()} />
    </Container>
  );
};
