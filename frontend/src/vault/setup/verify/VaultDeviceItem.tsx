import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { borderRadius } from '../../../lib/ui/css/borderRadius';
import { horizontalPadding } from '../../../lib/ui/css/horizontalPadding';
import {
  ComponentWithIndexProps,
  ComponentWithValueProps,
} from '../../../lib/ui/props';
import { text } from '../../../lib/ui/text';
import { getColor } from '../../../lib/ui/theme/getters';
import { useCurrentLocalPartyId } from '../../keygen/state/currentLocalPartyId';
import {
  getKeygenDeviceName,
  parseLocalPartyId,
} from '../../keygen/utils/localPartyId';
import { useVaultKeygenDevices } from '../hooks/useVaultKegenDevices';

const Container = styled.div`
  height: 64px;
  ${horizontalPadding(28)};
  ${borderRadius.s};
  background: ${getColor('foreground')};

  ${text({
    family: 'mono',
    size: 14,
    weight: '400',
    color: 'regular',
    centerVertically: true,
  })}
`;

export const VaultDeviceItem = ({
  value,
  index,
}: ComponentWithValueProps<string> & ComponentWithIndexProps) => {
  const localPartyId = useCurrentLocalPartyId();

  const isCurrentDevice = localPartyId === value;

  const devices = useVaultKeygenDevices();

  const { id } = parseLocalPartyId(value);

  const { t } = useTranslation();

  return (
    <Container>
      {t('part')} {index + 1} {t('of')} {devices.length}:{' '}
      {getKeygenDeviceName(id)} {isCurrentDevice ? `(${t('this_device')})` : ''}
    </Container>
  );
};
