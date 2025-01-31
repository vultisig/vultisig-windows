import styled, { css } from 'styled-components';

import { UnstyledButton } from '../../../../../lib/ui/buttons/UnstyledButton';
import { borderRadius } from '../../../../../lib/ui/css/borderRadius';
import { centerContent } from '../../../../../lib/ui/css/centerContent';
import { round } from '../../../../../lib/ui/css/round';
import { sameDimensions } from '../../../../../lib/ui/css/sameDimensions';
import { CheckIcon } from '../../../../../lib/ui/icons/CheckIcon';
import { VStack, vStack } from '../../../../../lib/ui/layout/Stack';
import { IsActiveProp, ValueProp } from '../../../../../lib/ui/props';
import { Text } from '../../../../../lib/ui/text';
import { getColor } from '../../../../../lib/ui/theme/getters';
import { usePeersSelectionRecord } from '../../../../keysign/shared/state/selectedPeers';
import {
  formatKeygenDeviceName,
  getKeygenDeviceType,
  parseLocalPartyId,
} from '../../../utils/localPartyId';
import { KeygenDeviceIcon } from '../../device/KeygenDeviceIcon';

const Container = styled(UnstyledButton)<IsActiveProp>`
  position: relative;

  ${borderRadius.s}
  padding: 8px 16px;
  min-width: 92px;
  background: ${getColor('foreground')};
  border: 1px solid transparent;
  ${({ isActive }) =>
    isActive
      ? css`
          border-color: ${getColor('contrast')};
        `
      : css`
          &:hover {
            border-color: ${getColor('contrast')};
          }
        `}

  ${vStack({
    alignItems: 'center',
    gap: 8,
  })}
`;

const Indicator = styled.div`
  position: absolute;
  right: 4px;
  top: 4px;
  ${round};
  background: ${getColor('primary')};
  ${sameDimensions(12)}
  color: ${getColor('contrast')};
  ${centerContent}
  font-size: 10px;
`;

export const PeerOption = ({ value }: ValueProp<string>) => {
  const [record, setRecord] = usePeersSelectionRecord();

  const isSelected = record[value];

  const { deviceName, hash } = parseLocalPartyId(value);

  return (
    <Container
      onClick={() => {
        setRecord(prev => ({
          ...prev,
          [value]: !isSelected,
        }));
      }}
      isActive={isSelected}
    >
      {isSelected && (
        <Indicator>
          <CheckIcon />
        </Indicator>
      )}
      <KeygenDeviceIcon
        style={{ fontSize: 50 }}
        value={getKeygenDeviceType(deviceName)}
      />
      <VStack alignItems="center">
        <Text weight="700" size={16} color="contrast">
          {formatKeygenDeviceName(deviceName)}
        </Text>
        <Text weight="600" size={12} color="contrast">
          {hash}
        </Text>
      </VStack>
    </Container>
  );
};
