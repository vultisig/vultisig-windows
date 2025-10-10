import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { InfoIcon } from '@lib/ui/icons/InfoIcon'
import { hStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

export const ShareBanner = () => {
  const { t } = useTranslation()

  return (
    <Wrapper>
      <IconWrapper size={16}>
        <InfoIcon />
      </IconWrapper>
      <Text size={13} color="shyExtra">
        {t('vault_share_banner')}
      </Text>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  ${hStack({
    gap: 12,
    alignItems: 'center',
  })};

  padding: 24px;
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 12px;
  background: ${getColor('foreground')};
`
