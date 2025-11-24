import { IconButton } from '@lib/ui/buttons/IconButton'
import { useBoolean } from '@lib/ui/hooks/useBoolean'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { NavigationXIcon } from '@lib/ui/icons/NavigationXIcon'
import { hStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

export const InfoBanner = () => {
  const [isOpen, { toggle }] = useBoolean(true)
  const { t } = useTranslation()

  if (!isOpen) return null

  return (
    <BannerWrapper>
      <Text size={12} color="shyExtra">
        {t('circle.banner_text')}
      </Text>
      <IconButton onClick={toggle}>
        <IconWrapper size={8}>
          <NavigationXIcon />
        </IconWrapper>
      </IconButton>
    </BannerWrapper>
  )
}

const BannerWrapper = styled.div`
  ${hStack({
    justifyContent: 'space-between',
  })};

  padding: 13px;
  border: 1px solid ${getColor('foregroundExtra')};
  background: ${getColor('foreground')};
`
