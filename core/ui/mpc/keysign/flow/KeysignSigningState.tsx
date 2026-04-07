import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { KeysignLoadingAnimation } from './KeysignLoadingAnimation'

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
