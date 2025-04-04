import { Match } from '@lib/ui/base/Match'
import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { LightningGradientIcon } from '@lib/ui/icons/LightningGradientIcon'
import { LightningIcon } from '@lib/ui/icons/LightningIcon'
import ShieldCheckIcon from '@lib/ui/icons/ShieldCheckIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { GradientText, Text } from '@lib/ui/text'
import { match } from '@lib/utils/match'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import { getFormProps } from '../../../lib/ui/form/utils/getFormProps'
import { ToggleSwitch } from '../../../lib/ui/toggle-switch/ToggleSwitch'
import { useAppNavigate } from '../../../navigation/hooks/useAppNavigate'
import { PageContent } from '../../../ui/page/PageContent'
import { PageHeader } from '../../../ui/page/PageHeader'
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle'
import { getSetupVaultProperties } from '../type/SetupVaultType'
import { useSetupVaultType } from '../type/state/setupVaultType'
import { useSetupVaultPageAnimation } from './hooks/useSetupVaultPageAnimation'
import {
  ArtContainer,
  ConfirmButton,
  ContentWrapper,
  DescriptionContentWrapper,
  DescriptionTitleWrapper,
  DescriptionWrapper,
  IconWrapper,
} from './SetupVaultPage.styled'

export const SetupVaultPage = () => {
  const { RiveComponent, stateMachineInput, isPlaying, onPlay } =
    useSetupVaultPageAnimation()
  const { t } = useTranslation()
  const [value, setValue] = useSetupVaultType()
  const navigate = useAppNavigate()
  const theme = useTheme()

  const onStart = useCallback(() => {
    navigate(
      match(value, {
        fast: () => 'setupFastVault',
        secure: () => 'setupSecureVault',
      })
    )
  }, [navigate, value])

  return (
    <>
      <PageHeader
        title={<PageHeaderTitle>{t('chooseSetup')}</PageHeaderTitle>}
        primaryControls={<PageHeaderBackButton />}
      />
      <PageContent
        gap={40}
        as="form"
        {...getFormProps({
          onSubmit: onStart,
        })}
      >
        <ContentWrapper alignItems="center" gap={48} flexGrow>
          <ArtContainer data-testid="SetupVaultPage-ArtContainer">
            <RiveComponent />
          </ArtContainer>
          <div
            style={{
              alignSelf: 'stretch',
            }}
          >
            <ToggleSwitch
              options={[
                {
                  label: 'Secure',
                  value: 'secure',
                  icon: (
                    <VStack
                      alignItems="center"
                      style={{
                        fontSize: '24px',
                        color:
                          value === 'fast'
                            ? theme.colors.contrast.toCssValue()
                            : theme.colors.success.toCssValue(),
                      }}
                    >
                      <ShieldCheckIcon />
                    </VStack>
                  ),
                },
                {
                  label: 'Fast',
                  value: 'fast',
                  icon:
                    value === 'fast' ? (
                      <LightningGradientIconWrapper>
                        <LightningGradientIcon />
                      </LightningGradientIconWrapper>
                    ) : (
                      <LightningIconWrapper>
                        <LightningIcon
                          color={theme.colors.contrast.toCssValue()}
                        />
                      </LightningIconWrapper>
                    ),
                },
              ]}
              disabled={isPlaying}
              selected={value}
              onChange={newValue => {
                if (isPlaying) return
                onPlay()
                setValue(newValue)
                stateMachineInput?.fire()
              }}
            />
          </div>
          <DescriptionWrapper alignItems="flex-start">
            <DescriptionTitleWrapper>
              <Match
                value={value}
                fast={() => (
                  <GradientText weight={500}>
                    {t(`vault_setup_prop.fast.title`)}
                  </GradientText>
                )}
                secure={() => (
                  <Text color="primary" weight={500}>
                    {t(`vault_setup_prop.secure.title`)}
                  </Text>
                )}
              />
            </DescriptionTitleWrapper>
            <DescriptionContentWrapper>
              {getSetupVaultProperties(value, t).map(prop => (
                <HStack key={prop} alignItems="center" gap={6}>
                  <IconWrapper>
                    <CheckIcon />
                  </IconWrapper>
                  <Text size={14} weight="600" color="contrast">
                    {prop}
                  </Text>
                </HStack>
              ))}
            </DescriptionContentWrapper>
          </DescriptionWrapper>
          <ConfirmButton type="submit">{t('next')}</ConfirmButton>
        </ContentWrapper>
      </PageContent>
    </>
  )
}

const LightningGradientIconWrapper = styled.div`
  position: relative;
  font-size: 24px;
  margin-top: -1px;
`

const LightningIconWrapper = styled.div`
  font-size: 20px;
  margin-right: 3px;
`
