import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '../../../../lib/ui/buttons/Button'
import { useBoolean } from '../../../../lib/ui/hooks/useBoolean'
import { LightningIcon } from '../../../../lib/ui/icons/LightningIcon'
import { AnimatedVisibility } from '../../../../lib/ui/layout/AnimatedVisibility'
import { HStack, VStack } from '../../../../lib/ui/layout/Stack'
import { OnForwardProp } from '../../../../lib/ui/props'
import { Text } from '../../../../lib/ui/text'
import { SetupVaultType } from '../../type/SetupVaultType'
import { getBackupItemsForVaultType } from './constants'
import {
  ContentWrapper,
  IconWrapper,
  LightningIconWrapper,
  PillWrapper,
  StyledCheckbox,
  SummaryListItem,
  Wrapper,
} from './SetupVaultSummaryStep.styles'

type SetupVaultSummaryStepProps = OnForwardProp & {
  vaultType: SetupVaultType
  vaultShares?: number
}

export const SetupVaultSummaryStepOld: FC<SetupVaultSummaryStepProps> = ({
  vaultType,
  onForward,
  vaultShares,
}) => {
  const { t } = useTranslation()
  const [isChecked, { toggle }] = useBoolean(false)
  const summaryItems = getBackupItemsForVaultType(vaultType)
  const isFastVault = vaultType === 'fast'

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
            {summaryItems.map(({ title, icon: Icon }) => (
              <SummaryListItem alignItems="center" key={title}>
                <IconWrapper>
                  <Icon />
                </IconWrapper>
                <Text color="contrast" weight={500} size={13}>
                  {t(
                    title,
                    title === 'yourVaultShares' ? { shares: vaultShares } : {}
                  )}
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
            <StyledCheckbox onChange={() => {}} value={isChecked} />
            <Text color="contrast" weight={500} size={14}>
              {t('fastVaultSetup.summary.agreementText')}
            </Text>
          </HStack>
          <Button isDisabled={!isChecked} onClick={onForward}>
            {t('fastVaultSetup.summary.start_using_vault')}
          </Button>
        </VStack>
      </Wrapper>
    </AnimatedVisibility>
  )
}
