import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { feePriorities, FeePriority } from '../../../../chain/fee/FeePriority';
import { Button } from '../../../../lib/ui/buttons/Button';
import { getFormProps } from '../../../../lib/ui/form/utils/getFormProps';
import { AmountTextInput } from '../../../../lib/ui/inputs/AmountTextInput';
import { InputContainer } from '../../../../lib/ui/inputs/InputContainer';
import { InputLabel } from '../../../../lib/ui/inputs/InputLabel';
import { RadioInput } from '../../../../lib/ui/inputs/RadioInput';
import { VStack } from '../../../../lib/ui/layout/Stack';
import { Modal } from '../../../../lib/ui/modal';
import { ClosableComponentProps } from '../../../../lib/ui/props';
import { shouldBePresent } from '../../../../lib/utils/assert/shouldBePresent';
import { useFeeSettings } from './state/feeSettings';

type FeeSettingsFormShape = {
  priority: FeePriority;
  gasLimit: number | null;
};

export const ManageFeeSettingsOverlay: React.FC<ClosableComponentProps> = ({
  onClose,
}) => {
  const { t } = useTranslation();

  const [persistentValue, setPersistentValue] = useFeeSettings();

  const [value, setValue] = useState<FeeSettingsFormShape>(
    shouldBePresent(persistentValue)
  );

  return (
    <Modal
      as="form"
      {...getFormProps({
        onSubmit: () => {
          setPersistentValue({
            ...value,
            gasLimit: value.gasLimit ?? 0,
          });
          onClose();
        },
        onClose,
      })}
      onClose={onClose}
      title={t('advanced')}
      footer={<Button type="submit">{t('save')}</Button>}
    >
      <VStack gap={8}>
        <InputContainer>
          <InputLabel>{t('priority')}</InputLabel>
          <RadioInput
            options={feePriorities}
            value={value.priority}
            onChange={priority => setValue({ ...value, priority })}
            renderOption={t}
          />
        </InputContainer>
        <AmountTextInput
          label={<InputLabel>{t('gas_limit')}</InputLabel>}
          value={value.gasLimit}
          onValueChange={gasLimit => setValue({ ...value, gasLimit })}
        />
      </VStack>
    </Modal>
  );
};
