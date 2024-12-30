import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { BrowserOpenURL } from '../../../../wailsjs/runtime/runtime';
import { UnstyledButton } from '../../../lib/ui/buttons/UnstyledButton';
import { ComponentWithValueProps } from '../../../lib/ui/props';
import { text } from '../../../lib/ui/text';

const Container = styled(UnstyledButton)`
  align-self: flex-end;
  ${text({
    weight: 600,
    color: 'primary',
  })}
  text-decoration: underline;
`;

export const SwapTrackingLink = ({
  value,
}: ComponentWithValueProps<string>) => {
  const { t } = useTranslation();

  return (
    <Container
      onClick={() => {
        BrowserOpenURL(value);
      }}
    >
      {t('swap_tracking_link')}
    </Container>
  );
};
