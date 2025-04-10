import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { formatMpcDeviceName, parseLocalPartyId } from '../localPartyId'
import { useMpcLocalPartyId } from '../localPartyId/state/mpcLocalPartyId'
import { peerOption, peerOptionActive } from './option/PeerOptionContainer'

const Container = styled.div`
  ${peerOption}
  ${peerOptionActive}
  border-color: rgba(19, 200, 157, 0.25);
`

export const InitiatingDevice = () => {
  const localPartyId = useMpcLocalPartyId()
  const { deviceName } = parseLocalPartyId(localPartyId)

  const { t } = useTranslation()

  return (
    <Container>
      <VStack>
        <Text color="contrast" size={14} weight="500">
          {formatMpcDeviceName(deviceName)}
          <Text color="shy" size={13} weight="500">
            {t('this_device')}
          </Text>
        </Text>
      </VStack>
    </Container>
  )
}
