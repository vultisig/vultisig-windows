import { useRive } from '@rive-app/react-canvas';
import { useTranslation } from 'react-i18next';

import { Match } from '../../../../../lib/ui/base/Match';
import { CheckIconGreen } from '../../../../../lib/ui/icons/CheckIconGreen';
import { HStack, VStack } from '../../../../../lib/ui/layout/Stack';
import { ValueProp } from '../../../../../lib/ui/props';
import { Text } from '../../../../../lib/ui/text';
import {
  formatKeygenDeviceName,
  parseLocalPartyId,
} from '../../../../keygen/utils/localPartyId';
import { usePeersSelectionRecord } from '../../../../keysign/shared/state/selectedPeers';
import {
  CheckIconWrapper,
  RiveWrapper,
  StyledText,
  Wrapper,
} from './SecureVaultPeerOption.styled';

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

  const handleClick = () => {
    if (isCurrentDevice || !value) return;

    setRecord(prev => ({
      ...prev,
      [value]: !isSelected,
    }));
  };

  return (
    <Wrapper
      role="button"
      tabIndex={0}
      onClick={handleClick}
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
