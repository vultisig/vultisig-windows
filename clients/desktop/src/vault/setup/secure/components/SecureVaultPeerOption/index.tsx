import { recommendedPeers } from '@core/mpc/peers/config'
import { useRive } from '@rive-app/react-canvas'
import { useTranslation } from 'react-i18next'

import { Match } from '../../../../../lib/ui/base/Match'
import { CheckIconGreen } from '../../../../../lib/ui/icons/CheckIconGreen'
import { HStack } from '../../../../../lib/ui/layout/Stack'
import { IndexProp, ValueProp } from '../../../../../lib/ui/props'
import { Text } from '../../../../../lib/ui/text'
import { PeerOptionContainer } from '../../../../../mpc/peers/option/PeerOptionContainer'
import {
  formatKeygenDeviceName,
  parseLocalPartyId,
} from '../../../../keygen/utils/localPartyId'
import { usePeersSelectionRecord } from '../../../../keysign/shared/state/selectedPeers'
import {
  CheckIconWrapper,
  RiveWrapper,
  StyledText,
} from './SecureVaultPeerOption.styled'

type SecureVaultPeerOptionProps = IndexProp & {
  shouldShowOptionalDevice: boolean
}

export const SecureVaultPeerOption = ({
  value,
  index,
  shouldShowOptionalDevice,
}: ValueProp<string> & SecureVaultPeerOptionProps) => {
  const [record, setRecord] = usePeersSelectionRecord()
  const { t } = useTranslation()
  const isSelected = record[value]
  const { deviceName, hash } = parseLocalPartyId(value)
  const formattedDeviceName = formatKeygenDeviceName(deviceName)
  const { RiveComponent } = useRive({
    src: '/assets/animations/keygen-secure-vault/waiting-on-device.riv',
    autoplay: true,
  })

  const handleClick = () => {
    if (!value) return

    setRecord(prev => ({
      ...prev,
      [value]: !isSelected,
    }))
  }

  return (
    <PeerOptionContainer onClick={handleClick} isActive={isSelected}>
      <Match
        value={
          value.length === 0 || shouldShowOptionalDevice
            ? 'placeholder'
            : 'device'
        }
        placeholder={() => (
          <>
            <RiveWrapper>
              <RiveComponent />
            </RiveWrapper>
            <StyledText color="contrast" size={14} weight="500">
              {t(
                index > recommendedPeers ? 'optionalDevice' : 'scanWithDevice',
                {
                  index,
                }
              )}
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
    </PeerOptionContainer>
  )
}
