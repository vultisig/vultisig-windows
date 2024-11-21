import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { feePriorities } from '../../../../chain/fee/FeePriority';
import { CancelSubmitFooter } from '../../../../lib/ui/form/components/CancelSubmitFormFooter';
import { getFormProps } from '../../../../lib/ui/form/utils/getFormProps';
import { InputContainer } from '../../../../lib/ui/inputs/InputContainer';
import { InputLabel } from '../../../../lib/ui/inputs/InputLabel';
import { RadioInput } from '../../../../lib/ui/inputs/RadioInput';
import { Modal } from '../../../../lib/ui/modal';
import { ClosableComponentProps } from '../../../../lib/ui/props';
import { FeeSettings, useFeeSettings } from './state/feeSettings';

export const ManageFeeSettingsOverlay: React.FC<ClosableComponentProps> = ({
  onClose,
}) => {
  const { t } = useTranslation();

  const [persistentValue, setPersistentValue] = useFeeSettings();

  const [value, setValue] = useState<FeeSettings>({
    priority: persistentValue?.priority ?? 'normal',
    gasLimit: 2300,
  });

  return (
    <Modal
      as="form"
      {...getFormProps({
        onSubmit: () => {
          setPersistentValue(value);
          onClose();
        },
        onClose,
      })}
      onClose={onClose}
      title={t('advanced')}
      footer={
        <CancelSubmitFooter submitText={t('save')} cancelText={t('cancel')} />
      }
    >
      <InputContainer>
        <InputLabel>{t('priority')}</InputLabel>
        <RadioInput
          options={feePriorities}
          value={value.priority}
          onChange={priority => setValue({ ...value, priority })}
          renderOption={t}
        />
      </InputContainer>
    </Modal>
  );
};
