import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { TextInput } from '../../../lib/ui/inputs/TextInput';
import { text } from '../../../lib/ui/text';
import { useSendReceiver } from '../state/receiver';

const Input = styled(TextInput)`
  ${text({
    family: 'mono',
    weight: 400,
  })}
`;

export const ManageReceiver = () => {
  const [value, setValue] = useSendReceiver();

  const { t } = useTranslation();

  return (
    <Input
      label={t('to')}
      placeholder={t('enter_address')}
      value={value}
      onValueChange={setValue}
    />
  );
};
