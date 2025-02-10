import { useRive } from '@rive-app/react-canvas';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import { Match } from '../../../lib/ui/base/Match';
import { CheckIconGreen } from '../../../lib/ui/icons/CheckIconGreen';
import { HStack, hStack, VStack } from '../../../lib/ui/layout/Stack';
import { ValueProp } from '../../../lib/ui/props';
import { Text } from '../../../lib/ui/text';
import { getColor } from '../../../lib/ui/theme/getters';
import {
  formatKeygenDeviceName,
  parseLocalPartyId,
} from '../../keygen/utils/localPartyId';
import { usePeersSelectionRecord } from '../../keysign/shared/state/selectedPeers';

type SecureVaultPeerOptionProps = {
  isCurrentDevice: boolean;
  deviceNumber: number;
  shouldShowOptionalDevice: boolean;
};

export const SecureVaultPeerOption = ({
  value,
  isCurrentDevice,
  deviceNumber,
  shouldShowOptionalDevice,
}: ValueProp<string> & SecureVaultPeerOptionProps) => {
  const [record, setRecord] = usePeersSelectionRecord();
  const { t } = useTranslation();
  const isSelected = record[value];
  const { deviceName, hash } = parseLocalPartyId(value);
  const formattedDeviceName = formatKeygenDeviceName(deviceName);
  const { RiveComponent } = useRive({
    src: '/assets/animations/keygen-secure-vault/waiting-on-device.riv',
    autoplay: true,
  });

  return (
    <Wrapper
      role="button"
      tabIndex={0}
      onClick={() => {
        if (isCurrentDevice || !value) return;

        setRecord(prev => ({
          ...prev,
          [value]: !isSelected,
        }));
      }}
      isActive={isSelected}
      isCurrentDevice={isCurrentDevice}
      gap={8}
      alignItems="center"
    >
      <Match
        value={
          isCurrentDevice
            ? 'currentDevice'
            : value.length === 0 || shouldShowOptionalDevice
              ? 'placeholder'
              : 'device'
        }
        currentDevice={() => (
          <VStack>
            <Text color="contrast" size={14} weight="500">
              {formattedDeviceName}
              <Text color="shy" size={13} weight="500">
                {t('thisDevice')}
              </Text>
            </Text>
          </VStack>
        )}
        placeholder={() => (
          <>
            <RiveWrapper>
              <RiveComponent />
            </RiveWrapper>
            <StyledText color="contrast" size={14} weight="500">
              {t(deviceNumber === 4 ? 'optionalDevice' : 'scanWithDevice', {
                deviceNumber,
              })}
            </StyledText>
          </>
        )}
        device={() => (
          <HStack flexGrow justifyContent="space-between" alignItems="center">
            <div>
              <Text color="contrast" weight={500}>
                {formattedDeviceName}
              </Text>
              <Text color="shy" weight={500}>
                {hash}
              </Text>
            </div>
            {isSelected && (
              <CheckIconWrapper>
                <CheckIconGreen />
              </CheckIconWrapper>
            )}
          </HStack>
        )}
      />
    </Wrapper>
  );
};

const Wrapper = styled(HStack)<{
  isActive: boolean;
  isCurrentDevice: boolean;
}>`
  padding: 16px;
  border-radius: 16px;
  width: 150px;

  ${({ isCurrentDevice, isActive }) =>
    isCurrentDevice || isActive
      ? css`
          cursor: initial;
          background: #042436;
          border: 1px solid
            ${isActive ? getColor('primary') : 'rgba(19, 200, 157, 0.25)'};
        `
      : css`
          border: 1px dashed ${getColor('foregroundSuper')};
        `}
`;

const RiveWrapper = styled.div`
  flex-shrink: 0;
  height: 24px;
  width: 24px;
`;

const CheckIconWrapper = styled.div`
  ${hStack()}
  align-items: center;
  justify-content: center;
  padding: 1px;
  background-color: ${getColor('primary')};
  border-radius: 50%;
  font-size: 24px;
`;

const StyledText = styled(Text)`
  word-break: break-all;
`;
