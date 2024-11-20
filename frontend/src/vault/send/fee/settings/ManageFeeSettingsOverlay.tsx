import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { feePriorities } from '../../../../chain/fee/FeePriority';
import { InputContainer } from '../../../../lib/ui/inputs/InputContainer';
import { InputLabel } from '../../../../lib/ui/inputs/InputLabel';
import { RadioInput } from '../../../../lib/ui/inputs/RadioInput';
import { Modal } from '../../../../lib/ui/modal';
import { ClosableComponentProps } from '../../../../lib/ui/props';
import { FeeSettings } from './state/feeSettings';

export const ManageFeeSettingsOverlay: React.FC<ClosableComponentProps> = ({
  onClose,
}) => {
  const { t } = useTranslation();

  const [value, setValue] = useState<FeeSettings>({
    priority: 'normal',
    gasLimit: 2300,
  });

  return (
    <Modal onClose={onClose} title={t('advanced')}>
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
