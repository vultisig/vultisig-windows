import { useTranslation } from 'react-i18next';

import { AmountTextInput } from '../../../lib/ui/inputs/AmountTextInput';
import { useSendAmount } from '../state/amount';

export const ManageAmount = () => {
  const [value, setValue] = useSendAmount();

  const { t } = useTranslation();

  return (
    <AmountTextInput
      label={t('amount')}
      placeholder={t('enter_amount')}
      value={value}
      onValueChange={setValue}
    />
  );
};
