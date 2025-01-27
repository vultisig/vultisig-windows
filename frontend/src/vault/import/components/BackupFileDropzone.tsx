import { t } from 'i18next';
import { useDropzone } from 'react-dropzone';

import { FileIcon } from '../../../lib/ui/icons/FileIcon';
import { InteractiveDropZoneContainer } from '../../../lib/ui/inputs/upload/DropZoneContainer';
import { DropZoneContent } from '../../../lib/ui/inputs/upload/DropZoneContent';
import { VStack } from '../../../lib/ui/layout/Stack';
import { StrictText } from '../../../lib/ui/text';

type BackupFileDropzoneProps = {
  onFinish: (data: File) => void;
};

export const BackupFileDropzone = ({ onFinish }: BackupFileDropzoneProps) => {
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/octet-stream': ['.bak', '.vult', '.dat'],
    },
    onDrop: acceptedFiles => {
      const [file] = acceptedFiles;
      if (file) {
        onFinish(file);
      }
    },
  });

  return (
    <VStack alignItems="center" gap={20} flexGrow>
      <StrictText>{t('upload_previous_vault')}</StrictText>
      <InteractiveDropZoneContainer {...getRootProps()}>
        <DropZoneContent icon={<FileIcon />}>
          {t('select_backup_file')}
        </DropZoneContent>
        <input {...getInputProps()} />
      </InteractiveDropZoneContainer>
    </VStack>
  );
};
