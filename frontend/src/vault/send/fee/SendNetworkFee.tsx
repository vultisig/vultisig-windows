import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { hStack } from '../../../lib/ui/layout/Stack';
import { Text, text } from '../../../lib/ui/text';
import { SendNetworkFeeValue } from './SendNetworkFeeValue';

const Container = styled.div`
  ${hStack({
    alignItems: 'center',
    justifyContent: 'space-between',
    fullWidth: true,
  })}

  ${text({
    color: 'contrast',
    size: 14,
    weight: 400,
    family: 'mono',
  })}
`;

export const SendNetworkFee = () => {
  const { t } = useTranslation();

  return (
    <Container>
      <Text>{t('network_fee')}</Text>
      <SendNetworkFeeValue />
    </Container>
  );
};
