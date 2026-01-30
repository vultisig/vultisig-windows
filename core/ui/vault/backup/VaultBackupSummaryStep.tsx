import { hasServer } from '@core/mpc/devices/localPartyId'
import { isKeyImportVault } from '@core/mpc/vault/Vault'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Button } from '@lib/ui/buttons/Button'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { Divider } from '@lib/ui/divider'
import { useBoolean } from '@lib/ui/hooks/useBoolean'
import { ArrowSplitIcon } from '@lib/ui/icons/ArrowSplitIcon'
import { CircleInfoIcon } from '@lib/ui/icons/CircleInfoIcon'
import { CloudCheckIcon } from '@lib/ui/icons/CloudCheckIcon'
import { CloudStackIcon } from '@lib/ui/icons/CloudStackIcon'
import { EmailIcon } from '@lib/ui/icons/EmailIcon'
import { LightningIcon } from '@lib/ui/icons/LightningIcon'
import { ShieldIcon } from '@lib/ui/icons/ShieldIcon'
import { Checkbox } from '@lib/ui/inputs/checkbox/Checkbox'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { HStack, hStack, VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { OnFinishProp } from '@lib/ui/props'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { useCoreNavigate } from '../../navigation/hooks/useCoreNavigate'

const StyledCheckbox = styled(Checkbox)`
  pointer-events: none;
`

const SummaryContainer = styled(PageContent)`
  flex-grow: 1;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding-block: 40px;
`

const Wrapper = styled(VStack)`
  max-width: 550px;
  width: 100%;
  gap: 64px;
  padding-block: 16px;
  border: 1px dashed var(--Borders-Light, #11284a);

  background: rgba(92, 167, 255, 0.03);

  border-top: 2px dashed ${getColor('foregroundExtra')};
  border-bottom: 2px dashed ${getColor('foregroundExtra')};
`

const BadgeIconWrapper = styled.div<{ isSecure?: boolean }>`
  font-size: 16px;
  color: ${({ isSecure }) =>
    isSecure ? getColor('success') : getColor('idle')};
`

const ContentWrapper = styled(VStack)<{ isSecure?: boolean }>`
  padding: 24px;
  background: ${({ isSecure }) =>
    isSecure ? 'rgba(0, 128, 0, 0.03)' : 'rgba(92, 167, 255, 0.03)'};

  gap: 24px;
  font-size: 24px;
  ${borderRadius.s};
`

const PillWrapper = styled(HStack)<{
  showLine?: boolean
  isSecure?: boolean
}>`
  position: relative;
  padding: 8px 12px;
  background-color: #07203e;
  border: 2px solid
    ${({ isSecure }) =>
      isSecure ? getColor('foreground') : getColor('foregroundExtra')};
  border-radius: 0px 9999px 9999px 0px;
  max-width: fit-content;

  ${hStack({
    justifyContent: 'center',
    alignItems: 'center',
  })};

  ${({ showLine }) =>
    showLine &&
    css`
      &:before {
        content: '';
        position: absolute;
        left: -3px;
        bottom: -463px;
        height: 501px;
        width: 2px;
        background-color: ${getColor('foreground')};
      }
    `}
`

const SummaryListItem = styled(HStack)<{ showLine?: boolean }>`
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

const IconWrapper = styled(VStack)<{ isSecure?: boolean }>`
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
  const vault = useCurrentVault()
  const { signers } = vault
  const navigate = useCoreNavigate()
  const isFastVault = hasServer(signers)
  const isKeyImport = isKeyImportVault(vault)

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
    <SummaryContainer>
      <AnimatedVisibility
        config={{
          duration: 1000,
        }}
        animationConfig="bottomToTop"
        delay={300}
      >
        <VStack
          style={{
            position: 'relative',
          }}
          gap={32}
        >
          <Wrapper data-testid="OnboardingSummary-Wrapper">
            <PillWrapper
              data-testid="OnboardingSummary-PillWrapper"
              alignItems="center"
              gap={8}
              showLine={true}
              isSecure={!isFastVault}
            >
              <BadgeIconWrapper isSecure={!isFastVault}>
                {isFastVault ? <LightningIcon /> : <ShieldIcon />}
              </BadgeIconWrapper>
              <Text size={12} color="shy">
                {isFastVault ? t('fastVault') : t('secureVault')}
              </Text>
            </PillWrapper>
            <ContentWrapper isSecure={!isFastVault}>
              <Text variant="h1Regular">{t('backupGuide')}</Text>
              <VStack gap={24}>
                {summaryItems.map(({ title, icon }) => (
                  <SummaryListItem
                    alignItems="center"
                    key={title}
                    showLine={isFastVault}
                  >
                    <IconWrapper isSecure={!isFastVault}>{icon}</IconWrapper>
                    <Text color="contrast" weight={500} size={13}>
                      {title}
                    </Text>
                  </SummaryListItem>
                ))}
              </VStack>
            </ContentWrapper>
          </Wrapper>
          <BlurEffect />

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
            <Button disabled={!isAgreed} onClick={onFinish}>
              {t('fastVaultSetup.summary.start_using_vault')}
            </Button>
            {!isKeyImport && (
              <>
                <Divider text={t('or').toUpperCase()} />
                <Button
                  disabled={!isAgreed}
                  kind="secondary"
                  onClick={() => {
                    navigate({ id: 'manageVaultChains' })
                  }}
                >
                  {t('fastVaultSetup.summary.select_preferred_chains')}
                </Button>
              </>
            )}
          </VStack>
        </VStack>
      </AnimatedVisibility>
    </SummaryContainer>
  )
}

const BlurEffect = styled.div`
  position: absolute;
  border-radius: 16px;
  border-radius: 350px;
  height: 450px;
  width: 500px;
  top: 150px;
  left: -50px;
  opacity: 0.7;
  background: radial-gradient(
    50% 50% at 50% 50%,
    rgba(50, 72, 132, 0.5) 0%,
    rgba(2, 18, 43, 0) 100%
  );
  filter: blur(36px);

  @media ${mediaQuery.tabletDeviceAndUp} {
  }
`
