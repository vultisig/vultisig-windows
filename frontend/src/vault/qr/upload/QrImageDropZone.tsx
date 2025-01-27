import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';

import { ComputerUploadIcon } from '../../../lib/ui/icons/ComputerUploadIcon';
import { InteractiveDropZoneContainer } from '../../../lib/ui/inputs/upload/DropZoneContainer';
import { DropZoneContent } from '../../../lib/ui/inputs/upload/DropZoneContent';

type QrImageDropZoneProps = {
  onFinish: (data: File) => void;
};

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

  const { t } = useTranslation();

  return (
    <InteractiveDropZoneContainer {...getRootProps()}>
      <DropZoneContent icon={<ComputerUploadIcon />}>
        {t('upload_qr_code_image')}
      </DropZoneContent>
      <input {...getInputProps()} />
    </InteractiveDropZoneContainer>
  );
};
