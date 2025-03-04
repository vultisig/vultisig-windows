import { MpcServerType, mpcServerTypes } from '@core/mpc/MpcServerType'
import { getPairComplement } from '@lib/utils/pair/getPairComplement'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { UnstyledButton } from '../../lib/ui/buttons/UnstyledButton'
import { text } from '../../lib/ui/text'
import { useMpcServerType } from './state/mpcServerType'

const Container = styled.div`
  ${text({
    size: 12,
    weight: 500,
    color: 'shy',
    centerVertically: { gap: 4 },
  })}
`

const Button = styled(UnstyledButton)`
  text-decoration: underline;
`

export const MpcServerTypeManager = () => {
  const [serverType, setServerType] = useMpcServerType()

  const { t } = useTranslation()

  const actionText: Record<MpcServerType, string> = {
    local: t('switchToInternet'),
    relay: t('switchToLocal'),
  }

  return (
    <Container>
      {serverType === 'relay' && <span>{t('signPrivately')}</span>}
      <Button
        onClick={() =>
          setServerType(getPairComplement(mpcServerTypes, serverType))
        }
      >
        {actionText[serverType]}
      </Button>
    </Container>
  )
}
