import { t } from 'i18next';

import { CheckIcon } from '../../../lib/ui/icons/CheckIcon';
import { DropZoneContainer } from '../../../lib/ui/inputs/upload/DropZoneContainer';
import { DropZoneContent } from '../../../lib/ui/inputs/upload/DropZoneContent';
import { UploadedFileItem } from '../../../lib/ui/inputs/upload/UploadedFileItem';
import { OnRemoveProp, ValueProp } from '../../../lib/ui/props';

type UploadedBackupFileProps = ValueProp<File> & OnRemoveProp;

export const UploadedBackupFile = ({
  value,
  onRemove,
}: UploadedBackupFileProps) => {
  return (
    <>
      <DropZoneContainer>
        <DropZoneContent icon={<CheckIcon />}>
          {t('select_backup_file')}
        </DropZoneContent>
      </DropZoneContainer>
      <UploadedFileItem fileName={value.name} onRemove={onRemove} />
    </>
  );
};
