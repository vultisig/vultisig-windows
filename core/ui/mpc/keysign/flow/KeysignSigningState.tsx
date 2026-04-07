import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { KeysignLoadingAnimation } from './KeysignLoadingAnimation'

/**
 * Full-screen signing state shown while an MPC keysign is in progress.
 * Renders the chain-aware Rive animation with the localized
 * "signing transaction" label overlaid at the bottom.
 */
export const KeysignSigningState = () => {
  const { t } = useTranslation()

  return (
    <Container>
      <KeysignLoadingAnimation isConnected />
      <Label color="regular" size={22} weight="500">
        {t('signing_transaction')}
      </Label>
    </Container>
  )
}

const Container = styled.div`
  position: relative;
  flex-grow: 1;
  width: 100%;
  min-height: 0;
  overflow: hidden;
`

const Label = styled(Text)`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 48px;
  text-align: center;
  z-index: 1;
`
