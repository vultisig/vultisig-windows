import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { useBoolean } from '@lib/ui/hooks/useBoolean'
import { CloseIcon } from '@lib/ui/icons/CloseIcon'
import { InfoIcon } from '@lib/ui/icons/InfoIcon'
import { hStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const Container = styled.div`
  ${hStack({
    gap: 12,
    alignItems: 'center',
  })}

  min-height: 52px;
  padding: 12px;
  ${borderRadius.m};
  background-color: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
`

const CloseButton = styled(UnstyledButton)`
  font-size: 12px;
  padding: 4px 4px;
  padding-bottom: 1px;
  border-radius: 24px;
  background-color: ${getColor('foregroundExtra')};
`

export const PeerRequirementsInfo = () => {
  const [shouldShow, { unset: hide }] = useBoolean(true)

  const { t } = useTranslation()

  if (!shouldShow) {
    return null
  }

  return (
    <Container>
      <Text weight={500} color="shy" size={13} centerVertically={{ gap: 8 }}>
        <InfoIcon />
        <span>{t('scanQrInstruction')}</span>
      </Text>
      <CloseButton onClick={hide}>
        <CloseIcon />
      </CloseButton>
    </Container>
  )
}
