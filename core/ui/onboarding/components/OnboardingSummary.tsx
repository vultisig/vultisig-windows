import { useSetHasFinishedOnboardingMutation } from '@core/ui/storage/onboarding'
import { Button } from '@lib/ui/buttons/Button'
import { useBoolean } from '@lib/ui/hooks/useBoolean'
import { CloudDownloadIcon } from '@lib/ui/icons/CloudDownloadIcon'
import { LayersIcon } from '@lib/ui/icons/LayersIcon'
import { SplitIcon } from '@lib/ui/icons/SplitIcon'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { Checkbox as LibCheckBox } from '@lib/ui/inputs/checkbox/Checkbox'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

export const OnboardingSummary = () => {
  const { t } = useTranslation()
  const { mutateAsync: onFinish } = useSetHasFinishedOnboardingMutation()
  const [isChecked, { toggle }] = useBoolean(false)

  const items = [
    {
      icon: <InfoIcon as={CloudDownloadIcon} />,
      title: t('fastVaultSetup.summary.summaryItemOneTitle'),
    },
    {
      icon: <InfoIcon as={SplitIcon} />,
      title: t('fastVaultSetup.summary.summaryItemTwoTitle'),
    },
    {
      icon: <InfoIcon as={LayersIcon} />,
      title: t('fastVaultSetup.summary.summaryItemThreeTitle'),
    },
    {
      icon: <WarningIcon as={TriangleAlertIcon} />,
      title: t('fastVaultSetup.summary.summaryItemFourTitle'),
    },
  ]

  return (
    <NoScroll alignItems="center" justifyContent="center" flexGrow>
      <Wrapper
        animationConfig="bottomToTop"
        as={AnimatedVisibility}
        config={{ duration: 1000 }}
        delay={300}
        gap={32}
        maxWidth={480}
        fullWidth
      >
        <NoScroll gap={24}>
          <Label>{t('fastVaultSetup.summary.pillText')}</Label>
          <Summary>
            <Text as="span" size={34} weight={500}>
              {t('fastVaultSetup.summary.title')}
            </Text>
            {items.map((item, index) => (
              <Item key={index}>
                {item.icon}
                <Text as="span" size={13} weight={500}>
                  {item.title}
                </Text>
              </Item>
            ))}
          </Summary>
        </NoScroll>
        <VStack alignItems="start" gap={16}>
          <HStack
            alignItems="center"
            gap={8}
            onClick={toggle}
            role="button"
            tabIndex={0}
          >
            <CheckBox onChange={() => {}} value={isChecked} />
            <Text as="span" size={14} weight={500}>
              {t('fastVaultSetup.summary.agreementText')}
            </Text>
          </HStack>
          <Button disabled={!isChecked} onClick={() => onFinish(true)}>
            {t('fastVaultSetup.summary.ctaText')}
          </Button>
        </VStack>
      </Wrapper>
    </NoScroll>
  )
}

const CheckBox = styled(LibCheckBox)`
  pointer-events: none;
`

const InfoIcon = styled.div`
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

const Label = styled.div`
  background-color: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  border-left: none;
  border-radius: 0 16px 16px 0;
  color: ${getColor('textShy')};
  font-size: 12px;
  line-height: 16px;
  margin-left: 2px;
  max-width: fit-content;
  padding: 8px 12px;
`

const NoScroll = styled(VStack)`
  overflow: hidden;
`

const Summary = styled(VStack)`
  border-radius: 8px;
  gap: 16px;
  font-size: 24px;
  padding-left: 24px;
`

const WarningIcon = styled.div`
  color: ${getColor('idle')};
  flex: none;
  font-size: 24px;
`

const Wrapper = styled(VStack)`
  padding: 24px;
`
