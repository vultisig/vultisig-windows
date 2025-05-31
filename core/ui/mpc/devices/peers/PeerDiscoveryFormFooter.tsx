import { MpcServerTypeManager } from '@core/ui/mpc/server/MpcServerTypeManager'
import { useCore } from '@core/ui/state/core'
import { Button } from '@lib/ui/buttons/Button'
import { vStack } from '@lib/ui/layout/Stack'
import { IsDisabledProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const Container = styled.div`
  ${vStack({ alignItems: 'center', gap: 8 })}
`

export const PeerDiscoveryFormFooter = ({ isDisabled }: IsDisabledProp) => {
  const { t } = useTranslation()
  const { isLocalModeAvailable } = useCore()

  return (
    <Container>
      <Button
        disabled={!!isDisabled}
        htmlType="submit"
        kind="primary"
        label={isDisabled ? t('waitingOnDevices') : t('next')}
      />
      {isLocalModeAvailable && <MpcServerTypeManager />}
    </Container>
  )
}
