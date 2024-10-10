import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import {
  textInputBackground,
  textInputFrame,
} from '../../../lib/ui/css/textInput';
import { InputContainer } from '../../../lib/ui/inputs/InputContainer';
import { InputLabel } from '../../../lib/ui/inputs/InputLabel';
import { vStack } from '../../../lib/ui/layout/Stack';
import { text } from '../../../lib/ui/text';
import { getColor } from '../../../lib/ui/theme/getters';
import { useAssertCurrentVaultAddress } from '../../state/useCurrentVault';
import { useCurrentSendCoin } from '../state/sendCoin';

const Container = styled.div`
  ${textInputFrame};
  ${textInputBackground};

  color: ${getColor('contrast')};

  ${vStack({
    justifyContent: 'center',
  })}

  ${text({
    size: 14,
    color: 'contrast',
    family: 'mono',
  })}
`;

export const Sender = () => {
  const [{ chainId }] = useCurrentSendCoin();
  const address = useAssertCurrentVaultAddress(chainId);

  const { t } = useTranslation();

  return (
    <InputContainer>
      <InputLabel>{t('from')}</InputLabel>
      <Container>{address}</Container>
    </InputContainer>
  );
};