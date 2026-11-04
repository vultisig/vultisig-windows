import { SettingsStrongCtaButton } from '@core/ui/settings/SettingsCtaButton'
import { SettingsPageFooter } from '@core/ui/settings/SettingsPageFooter'
import { borderRadius, borderRadiusPx } from '@lib/ui/css/borderRadius'
import { KeyboardFilledIcon } from '@lib/ui/icons/KeyboardFilledIcon'
import { MegaphoneIcon } from '@lib/ui/icons/MegaphoneIcon'
import { ShareUpRight2Icon } from '@lib/ui/icons/ShareUpRight2Icon'
import { TrophyIcon } from '@lib/ui/icons/TrophyIcon'
import { UsersFilledIcon } from '@lib/ui/icons/UsersFilledIcon'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { OnFinishProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { Overlay } from './Referrals.styled'

/** The onboarding guide explaining how referrals work. */
export const ReferralsSummary = ({ onFinish }: OnFinishProp) => {
  const { t } = useTranslation()

  const items = [
    {
      title: t('referrals_summary.item_1.title'),
      description: t('referrals_summary.item_1.description'),
      icon: KeyboardFilledIcon,
    },
    {
      title: t('referrals_summary.item_2.title'),
      description: t('referrals_summary.item_2.description'),
      icon: ShareUpRight2Icon,
    },
    {
      title: t('referrals_summary.item_3.title'),
      description: t('referrals_summary.item_3.description'),
      icon: TrophyIcon,
    },
    {
      title: t('referrals_summary.item_4.title'),
      description: t('referrals_summary.item_4.description'),
      icon: UsersFilledIcon,
    },
  ]

  return (
    <>
      <GuideContent alignItems="center">
        <Overlay />
        <VStack
          animationConfig="bottomToTop"
          as={AnimatedVisibility}
          config={{ duration: 1000 }}
          delay={300}
          maxWidth={480}
          fullWidth
        >
          <VStack gap={32} overflow="hidden">
            <Label>
              <Text as={MegaphoneIcon} color="primaryAlt" size={16} />
              {t('referral_program')}
            </Label>
            <VStack gap={16} padding="0 0 0 22px">
              <Heading as="span" size={34} weight={500}>
                {t('how_it_works')}
              </Heading>
              {items.map(({ title, icon, description }, index) => (
                <Item key={index}>
                  <Icon as={icon} />
                  <VStack gap={4}>
                    <Text variant="footnote">{title}</Text>
                    <Text color="shyExtra" variant="stationCaption2">
                      {description}
                    </Text>
                  </VStack>
                </Item>
              ))}
            </VStack>
          </VStack>
        </VStack>
      </GuideContent>
      <SettingsPageFooter>
        <SettingsStrongCtaButton onClick={onFinish}>
          {t('get_started')}
        </SettingsStrongCtaButton>
      </SettingsPageFooter>
    </>
  )
}

const GuideContent = styled(PageContent)`
  min-height: 0;
  overflow: hidden auto;
  padding-block: 5px 0;
  position: relative;
`

const Heading = styled(Text)`
  letter-spacing: -1px;
  line-height: ${37 / 34};
  margin: 0 0 32px 20px;
`

const Icon = styled.div`
  color: ${getColor('primaryAlt')};
  flex: none;
  font-size: 20px;
`

const Item = styled(HStack)`
  align-items: center;
  background-color: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  ${borderRadius.lg};
  gap: 12px;
  padding: 15px;
  position: relative;

  &::before {
    background-color: ${getColor('foreground')};
    content: '';
    height: 2px;
    left: -23px;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 22px;
  }

  &:last-child {
    &::after {
      background-color: ${getColor('foreground')};
      bottom: 50%;
      content: '';
      left: -23px;
      position: absolute;
      top: -1000px;
      width: 2px;
    }
  }
`

const Label = styled(HStack)`
  background-color: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  border-left: none;
  border-radius: 0 ${borderRadiusPx.lg}px ${borderRadiusPx.lg}px 0;
  color: ${getColor('textShy')};
  font-size: 12px;
  gap: 8px;
  line-height: 16px;
  margin-left: 2px;
  max-width: fit-content;
  padding: 8px 12px;
`
