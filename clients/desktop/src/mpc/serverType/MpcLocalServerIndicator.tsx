import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { borderRadius } from '../../lib/ui/css/borderRadius'
import { CloudOffIcon } from '../../lib/ui/icons/CloudOffIcon'
import { hStack } from '../../lib/ui/layout/Stack'
import { Text } from '../../lib/ui/text'
import { getColor } from '../../lib/ui/theme/getters'

const Container = styled.div`
  ${hStack({
    gap: 12,
    fullWidth: true,
  })}
  padding: 12px;
  color: ${getColor('primaryAlt')};
  border: 1px solid;
  ${borderRadius.m};
`

export const MpcLocalServerIndicator = () => {
  const { t } = useTranslation()

  return (
    <Container>
      <CloudOffIcon style={{ fontSize: 16 }} />
      <Text size={13} weight={500} color="shy">
        {t('localMode')}
      </Text>
    </Container>
  )
}
