import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { VStack } from '../../lib/ui/layout/Stack'
import { Text } from '../../lib/ui/text'
import { useCurrentLocalPartyId } from '../../vault/keygen/state/currentLocalPartyId'
import {
  formatKeygenDeviceName,
  parseLocalPartyId,
} from '../../vault/keygen/utils/localPartyId'
import { PeerOptionContainer } from './option/PeerOptionContainer'

const Container = styled(PeerOptionContainer)`
  border-color: rgba(19, 200, 157, 0.25);
`

export const InitiatingDevice = () => {
  const localPartyId = useCurrentLocalPartyId()
  const { deviceName } = parseLocalPartyId(localPartyId)

  const { t } = useTranslation()

  return (
    <Container isActive as="div">
      <VStack>
        <Text color="contrast" size={14} weight="500">
          {formatKeygenDeviceName(deviceName)}
          <Text color="shy" size={13} weight="500">
            {t('thisDevice')}
          </Text>
        </Text>
      </VStack>
    </Container>
  )
}
