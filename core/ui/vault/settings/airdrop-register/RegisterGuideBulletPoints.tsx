import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { LayersIcon } from '@lib/ui/icons/LayersIcon'
import { QrCodeIcon } from '@lib/ui/icons/QrCodeIcon'
import { SplitIcon } from '@lib/ui/icons/SplitIcon'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCore } from '../../../state/core'

export const RegisterGuideBulletPoints = () => {
  const { t } = useTranslation()
  const { openUrl } = useCore()

  const items = [
    {
      icon: (
        <SettingsIconWrapper>
          <QrCodeIcon />
        </SettingsIconWrapper>
      ),
      title: t('vault_register_for_airdrop_list_item_1'),
    },
    {
      icon: (
        <SettingsIconWrapper>
          <SplitIcon />
        </SettingsIconWrapper>
      ),
      title: (
        <Text color="contrast" size={13} weight={500}>
          {t('vault_register_for_airdrop_list_item_2_part_1')}{' '}
          <StyledLink onClick={() => openUrl('https://airdrop.vultisig.com')}>
            {t('vault_register_for_airdrop_list_item_2_part_2')}
          </StyledLink>
        </Text>
      ),
    },
    {
      icon: (
        <SettingsIconWrapper>
          <LayersIcon />
        </SettingsIconWrapper>
      ),
      title: t('vault_register_for_airdrop_list_item_3'),
    },
    {
      icon: (
        <SettingsIconWrapper>
          <TriangleAlertIcon />
        </SettingsIconWrapper>
      ),
      title: t('vault_register_for_airdrop_list_item_4'),
    },
  ]

  return (
    <VStack alignItems="center" flexGrow>
      <Wrapper gap={40} maxWidth={480} fullWidth>
        <Summary>
          <Text as="span" size={34} weight={500}>
            {t('register_guide')}
          </Text>
          <VStack gap={16}>
            {items.map((item, index) => (
              <Item key={index}>
                {item.icon}
                <Text as="span" size={13} weight={500}>
                  {item.title}
                </Text>
              </Item>
            ))}
          </VStack>
        </Summary>
      </Wrapper>
    </VStack>
  )
}

const SettingsIconWrapper = styled(IconWrapper)`
  color: ${getColor('primaryAlt')};
  flex: none;
  font-size: 24px;
`

const Item = styled(HStack)`
  align-items: center;
  background-color: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 16px;
  gap: 12px;
  padding: 16px;
  position: relative;

  &::before {
    background-color: ${getColor('foreground')};
    content: '';
    height: 2px;
    left: -24px;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 23px;
  }

  &:last-child {
    &::after {
      background-color: ${getColor('foreground')};
      bottom: 50%;
      content: '';
      left: -24px;
      position: absolute;
      top: -350px;
      width: 2px;
    }
  }
`

const Summary = styled(VStack)`
  border-radius: 8px;
  gap: 40px;
  font-size: 24px;
  padding-left: 24px;
`

const Wrapper = styled(VStack)`
  padding: 24px;
`

const StyledLink = styled.a`
  color: ${getColor('primary')};
  text-decoration: underline;
`
