import { hasServer } from '@core/mpc/devices/localPartyId'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Button } from '@lib/ui/buttons/Button'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { useBoolean } from '@lib/ui/hooks/useBoolean'
import { ArrowSplitIcon } from '@lib/ui/icons/ArrowSplitIcon'
import { CircleInfoIcon } from '@lib/ui/icons/CircleInfoIcon'
import { CloudCheckIcon } from '@lib/ui/icons/CloudCheckIcon'
import { CloudStackIcon } from '@lib/ui/icons/CloudStackIcon'
import { EmailIcon } from '@lib/ui/icons/EmailIcon'
import { LightningIcon } from '@lib/ui/icons/LightningIcon'
import { Checkbox } from '@lib/ui/inputs/checkbox/Checkbox'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { OnFinishProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const StyledCheckbox = styled(Checkbox)`
  pointer-events: none;
`

const Wrapper = styled(PageContent)`
  max-width: 550px;
  margin-inline: auto;
  padding-top: 100px;
  justify-content: space-between;
  overflow-y: hidden;
  gap: 64px;
`

const LightningIconWrapper = styled.div`
  font-size: 20px;
`

const ContentWrapper = styled(VStack)`
  padding: 24px;
  background: rgba(92, 167, 255, 0.03);
  border-top: 1px dashed ${getColor('foregroundExtra')};
  border-bottom: 1px dashed ${getColor('foregroundExtra')};
  gap: 24px;
  font-size: 24px;
  ${borderRadius.s};
`

const PillWrapper = styled(HStack)`
  position: relative;
  padding: 8px 12px;
  background-color: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 0px 9999px 9999px 0px;
  max-width: fit-content;
  border-left: 2px solid ${getColor('foregroundDark')};

  &:before {
    content: '';
    position: absolute;
    left: -2px;
    bottom: -463px;
    height: 463px;
    width: 2px;
    background-color: ${getColor('foreground')};
  }
`

const SummaryListItem = styled(HStack)`
  position: relative;
  gap: 12px;
  padding: 16px;
  border-radius: 16px;
  background-color: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};

  &:before {
    content: '';
    position: absolute;
    width: 23px;
    height: 2px;
    background-color: ${getColor('foregroundDark')};
    top: 50%;
    left: -24px;
    transform: translateY(-50%);
  }
`

const IconWrapper = styled(VStack)`
  justify-content: center;
  width: 24px;
  height: 24px;
  color: #4879fd;
`

type SetupVaultSummaryStepProps = OnFinishProp

export const VaultBackupSummaryStep: FC<SetupVaultSummaryStepProps> = ({
  onFinish,
}) => {
  const { t } = useTranslation()
  const [isAgreed, { toggle }] = useBoolean(false)
  const { signers } = useCurrentVault()

  const isFastVault = hasServer(signers)

  const summaryItems = [
    {
      title: isFastVault
        ? t('receivedShare1Email')
        : t('yourVaultShares', { shares: signers.length }),
      icon: isFastVault ? <EmailIcon /> : <CircleInfoIcon />,
    },
    {
      title: isFastVault
        ? t('share2StoredByYou')
        : t('fastVaultSetup.summary.summaryItemOneTitle'),
      icon: <CloudCheckIcon />,
    },
    {
      title: t('fastVaultSetup.summary.summaryItemTwoTitle'),
      icon: <ArrowSplitIcon />,
    },
    {
      title: t('fastVaultSetup.summary.summaryItemThreeTitle'),
      icon: <CloudStackIcon />,
    },
  ]

  return (
    <AnimatedVisibility
      config={{
        duration: 1000,
      }}
      animationConfig="bottomToTop"
      delay={300}
    >
      <Wrapper data-testid="OnboardingSummary-Wrapper">
        {isFastVault && (
          <PillWrapper
            data-testid="OnboardingSummary-PillWrapper"
            alignItems="center"
            gap={8}
          >
            <LightningIconWrapper>
              <LightningIcon color="#FFC25C" />
            </LightningIconWrapper>
            <Text size={12} color="shy">
              {t('fastVault')}
            </Text>
          </PillWrapper>
        )}
        <ContentWrapper>
          <Text variant="h1Regular">{t('backupGuide')}</Text>
          <VStack gap={24}>
            {summaryItems.map(({ title, icon }) => (
              <SummaryListItem alignItems="center" key={title}>
                <IconWrapper>{icon}</IconWrapper>
                <Text color="contrast" weight={500} size={13}>
                  {title}
                </Text>
              </SummaryListItem>
            ))}
          </VStack>
        </ContentWrapper>
        <VStack gap={16}>
          <HStack
            role="button"
            onClick={toggle}
            tabIndex={0}
            alignItems="center"
            gap={8}
          >
            <StyledCheckbox onChange={() => {}} value={isAgreed} />
            <Text color="contrast" weight={500} size={14}>
              {t('fastVaultSetup.summary.agreementText')}
            </Text>
          </HStack>
          <Button isDisabled={!isAgreed} onClick={onFinish}>
            {t('fastVaultSetup.summary.start_using_vault')}
          </Button>
        </VStack>
      </Wrapper>
    </AnimatedVisibility>
  )
}
