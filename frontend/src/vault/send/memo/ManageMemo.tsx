import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { TextInput } from '../../../lib/ui/inputs/TextInput';
import { text } from '../../../lib/ui/text';
import { useSendMemo } from '../state/memo';

const Input = styled(TextInput)`
  ${text({
    family: 'mono',
    weight: 400,
  })}
`;

export const ManageMemo = () => {
  const [value, setValue] = useSendMemo();

  const { t } = useTranslation();

  return (
    <Input
      label={`${t('memo')} (${t('optional')})`}
      placeholder={t('enter_memo')}
      value={value}
      onValueChange={setValue}
    />
  );
};
