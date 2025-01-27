import { t } from 'i18next';

import { CheckIcon } from '../../../lib/ui/icons/CheckIcon';
import { DropZoneContainer } from '../../../lib/ui/inputs/upload/DropZoneContainer';
import { DropZoneContent } from '../../../lib/ui/inputs/upload/DropZoneContent';
import { UploadedFileItem } from '../../../lib/ui/inputs/upload/UploadedFileItem';
import { VStack } from '../../../lib/ui/layout/Stack';
import {
  ComponentWithValueProps,
  RemovableComponentProps,
} from '../../../lib/ui/props';

type UploadedBackupFileProps = ComponentWithValueProps<File> &
  RemovableComponentProps;

export const UploadedBackupFile = ({
  value,
  onRemove,
}: UploadedBackupFileProps) => {
  return (
    <VStack fullWidth flexGrow gap={20}>
      <DropZoneContainer>
        <DropZoneContent icon={<CheckIcon />}>
          {t('select_backup_file')}
        </DropZoneContent>
      </DropZoneContainer>
      <UploadedFileItem fileName={value.name} onRemove={onRemove} />
    </VStack>
  );
};
