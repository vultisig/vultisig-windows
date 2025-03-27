import { OnForwardProp } from '@lib/ui/props'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '../../../../lib/ui/buttons/Button'
import { useBoolean } from '../../../../lib/ui/hooks/useBoolean'
import { ArrowSplitIcon } from '../../../../lib/ui/icons/ArrowSplitIcon'
import { CircleInfoIcon } from '../../../../lib/ui/icons/CircleInfoIcon'
import { CloudCheckIcon } from '../../../../lib/ui/icons/CloudCheckIcon'
import { CloudStackIcon } from '../../../../lib/ui/icons/CloudStackIcon'
import { EmailIcon } from '../../../../lib/ui/icons/EmailIcon'
import { LightningIcon } from '../../../../lib/ui/icons/LightningIcon'
import { AnimatedVisibility } from '../../../../lib/ui/layout/AnimatedVisibility'
import { HStack, VStack } from '../../../../lib/ui/layout/Stack'
import { Text } from '../../../../lib/ui/text'
import { hasServerSigner } from '../../../fast/utils/hasServerSigner'
import { useCurrentVault } from '../../../state/currentVault'
import {
  ContentWrapper,
  IconWrapper,
  LightningIconWrapper,
  PillWrapper,
  StyledCheckbox,
  SummaryListItem,
  Wrapper,
} from './SetupVaultSummaryStep.styles'

type SetupVaultSummaryStepProps = OnForwardProp

export const SetupVaultSummaryStep: FC<SetupVaultSummaryStepProps> = ({
  onForward,
}) => {
  const { t } = useTranslation()
  const [isAgreed, { toggle }] = useBoolean(false)
  const { signers } = useCurrentVault()

  const isFastVault = hasServerSigner(signers)

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
          <Button isDisabled={!isAgreed} onClick={onForward}>
            {t('fastVaultSetup.summary.start_using_vault')}
          </Button>
        </VStack>
      </Wrapper>
    </AnimatedVisibility>
  )
}
