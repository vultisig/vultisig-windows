import { MpcServerTypeManager } from '@core/ui/mpc/server/MpcServerTypeManager'
import { Button } from '@lib/ui/buttons/Button'
import { vStack } from '@lib/ui/layout/Stack'
import { IsDisabledProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCore } from '../../../state/core'

const Container = styled.div`
  ${vStack({ alignItems: 'center', gap: 8 })}
`

export const PeerDiscoveryFormFooter = ({ isDisabled }: IsDisabledProp) => {
  const { t } = useTranslation()

  const { isLocalModeAvailable } = useCore()

  return (
    <Container>
      <Button
        style={{ width: '100%' }}
        kind="primary"
        type="submit"
        isDisabled={isDisabled}
      >
        {isDisabled ? t('waitingOnDevices') : t('next')}
      </Button>
      {isLocalModeAvailable && <MpcServerTypeManager />}
    </Container>
  )
}
