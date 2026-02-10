import { Button } from '@lib/ui/buttons/Button'
import { GroupOneIcon } from '@lib/ui/icons/GroupOneIcon'
import { KeyboardUpIcon } from '@lib/ui/icons/KeyboardUpIcon'
import { MegaphoneIcon } from '@lib/ui/icons/MegaphoneIcon'
import { ShareAndroidIcon } from '@lib/ui/icons/ShareAndroidIcon'
import { TrophyIcon } from '@lib/ui/icons/TrophyIcon'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { OnFinishProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

export const ReferralsSummary = ({ onFinish }: OnFinishProp) => {
  const { t } = useTranslation()

  const items = [
    {
      title: t('referrals_summary.item_1.title'),
      description: t('referrals_summary.item_1.description'),
      icon: KeyboardUpIcon,
    },
    {
      title: t('referrals_summary.item_2.title'),
      description: t('referrals_summary.item_2.description'),
      icon: ShareAndroidIcon,
    },
    {
      title: t('referrals_summary.item_3.title'),
      description: t('referrals_summary.item_3.description'),
      icon: TrophyIcon,
    },
    {
      title: t('referrals_summary.item_4.title'),
      description: t('referrals_summary.item_4.description'),
      icon: GroupOneIcon,
    },
  ]

  return (
    <PageContent alignItems="center" scrollable>
      <VStack
        animationConfig="bottomToTop"
        as={AnimatedVisibility}
        config={{ duration: 1000 }}
        delay={300}
        gap={32}
        maxWidth={480}
        fullWidth
      >
        <VStack gap={24} overflow="hidden">
          <Label>
            <Text as={MegaphoneIcon} color="primaryAlt" size={16} />
            {t('referral_program')}
          </Label>
          <VStack gap={16} padding="0 0 0 24px">
            <Text as="span" size={34} weight={500}>
              {t('how_it_works')}
            </Text>
            {items.map(({ title, icon, description }, index) => (
              <Item key={index}>
                <Icon as={icon} />
                <VStack gap={4}>
                  <Text color="contrast" weight={500} size={13}>
                    {title}
                  </Text>
                  <Text color="shyExtra" weight={500} size={13}>
                    {description}
                  </Text>
                </VStack>
              </Item>
            ))}
          </VStack>
        </VStack>
        <Button onClick={onFinish}>{t('get_started')}</Button>
      </VStack>
    </PageContent>
  )
}

const Icon = styled.div`
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
      top: -1000px;
      width: 2px;
    }
  }
`

const Label = styled(HStack)`
  background-color: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  border-left: none;
  border-radius: 0 16px 16px 0;
  color: ${getColor('textShy')};
  font-size: 12px;
  gap: 8px;
  line-height: 16px;
  margin-left: 2px;
  max-width: fit-content;
  padding: 8px 12px;
`
