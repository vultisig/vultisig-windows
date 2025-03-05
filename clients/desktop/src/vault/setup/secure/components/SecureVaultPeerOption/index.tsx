import { CheckIconGreen } from '../../../../../lib/ui/icons/CheckIconGreen'
import { HStack } from '../../../../../lib/ui/layout/Stack'
import { ValueProp } from '../../../../../lib/ui/props'
import { Text } from '../../../../../lib/ui/text'
import { PeerOptionContainer } from '../../../../../mpc/peers/option/PeerOptionContainer'
import {
  formatKeygenDeviceName,
  parseLocalPartyId,
} from '../../../../keygen/utils/localPartyId'
import { usePeersSelectionRecord } from '../../../../keysign/shared/state/selectedPeers'
import { CheckIconWrapper } from './SecureVaultPeerOption.styled'

export const SecureVaultPeerOption = ({ value }: ValueProp<string>) => {
  const [record, setRecord] = usePeersSelectionRecord()
  const isSelected = record[value]
  const { deviceName, hash } = parseLocalPartyId(value)
  const formattedDeviceName = formatKeygenDeviceName(deviceName)

  const handleClick = () => {
    if (!value) return

    setRecord(prev => ({
      ...prev,
      [value]: !isSelected,
    }))
  }

  return (
    <PeerOptionContainer onClick={handleClick} isActive={isSelected}>
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
    </PeerOptionContainer>
  )
}
