import { hasServer } from '@core/mpc/devices/localPartyId'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Button } from '@lib/ui/buttons/Button'
import { useBoolean } from '@lib/ui/hooks/useBoolean'
import { ArrowSplitIcon } from '@lib/ui/icons/ArrowSplitIcon'
import { CircleInfoIcon } from '@lib/ui/icons/CircleInfoIcon'
import { CloudCheckIcon } from '@lib/ui/icons/CloudCheckIcon'
import { CloudStackIcon } from '@lib/ui/icons/CloudStackIcon'
import { EmailIcon } from '@lib/ui/icons/EmailIcon'
import { LightningIcon } from '@lib/ui/icons/LightningIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { OnFinishProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { AnimatedVisibility } from '../../../shared/AnimatedVisibility'
import {
  ContentWrapper,
  IconWrapper,
  LightningIconWrapper,
  PillWrapper,
  StyledCheckbox,
  SummaryListItem,
  Wrapper,
} from './SetupVaultSummaryStep.styles'

type SetupVaultSummaryStepProps = OnFinishProp

export const SetupVaultSummaryStep: FC<SetupVaultSummaryStepProps> = ({
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
