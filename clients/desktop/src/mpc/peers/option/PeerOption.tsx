import { ValueProp } from '@lib/ui/props'
import styled from 'styled-components'

import { centerContent } from '../../../lib/ui/css/centerContent'
import { round } from '../../../lib/ui/css/round'
import { sameDimensions } from '../../../lib/ui/css/sameDimensions'
import { CheckIcon } from '../../../lib/ui/icons/CheckIcon'
import { HStack } from '../../../lib/ui/layout/Stack'
import { Text } from '../../../lib/ui/text'
import { getColor } from '../../../lib/ui/theme/getters'
import { formatMpcDeviceName, parseLocalPartyId } from '../../localPartyId'
import { useMpcPeersSelectionRecord } from '../state/mpcSelectedPeers'
import { PeerOptionContainer } from './PeerOptionContainer'

const IconContainer = styled.div`
  ${round};
  ${sameDimensions(24)};
  ${centerContent};
  background-color: ${getColor('primary')};
  color: ${getColor('background')};
  font-size: 16px;
`

export const PeerOption = ({ value }: ValueProp<string>) => {
  const [record, setRecord] = useMpcPeersSelectionRecord()
  const isSelected = record[value]
  const { deviceName, hash } = parseLocalPartyId(value)
  const formattedDeviceName = formatMpcDeviceName(deviceName)

  return (
    <PeerOptionContainer
      onClick={() =>
        setRecord(prev => ({
          ...prev,
          [value]: !prev[value],
        }))
      }
      isActive={isSelected}
    >
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
          <IconContainer>
            <CheckIcon />
          </IconContainer>
        )}
      </HStack>
    </PeerOptionContainer>
  )
}
