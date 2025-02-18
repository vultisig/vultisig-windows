import { match } from '@lib/utils/match';
import { useRive, useStateMachineInput } from '@rive-app/react-canvas';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';

import { getFormProps } from '../../../lib/ui/form/utils/getFormProps';
import { useBoolean } from '../../../lib/ui/hooks/useBoolean';
import { CheckIcon } from '../../../lib/ui/icons/CheckIcon';
import { LightningGradientIcon } from '../../../lib/ui/icons/LightningGradientIcon';
import { LightningIcon } from '../../../lib/ui/icons/LightningIcon';
import ShieldCheckIcon from '../../../lib/ui/icons/ShieldCheckIcon';
import { HStack } from '../../../lib/ui/layout/Stack';
import { GradientText, Text } from '../../../lib/ui/text';
import { ToggleSwitch } from '../../../lib/ui/toggle-switch/ToggleSwitch';
import { useAppNavigate } from '../../../navigation/hooks/useAppNavigate';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { getSetupVaultProperties } from '../type/SetupVaultType';
import { useSetupVaultType } from '../type/state/setupVaultType';
import {
  ArtContainer,
  ConfirmButton,
  ContentWrapper,
  DescriptionContentWrapper,
  DescriptionTitleWrapper,
  DescriptionWrapper,
  IconWrapper,
} from './SetupVaultPage.styled';

const STATE_MACHINE_NAME = 'State Machine 1';
const STATE_INPUT_NAME = 'Switch';

export const SetupVaultPage = () => {
  const [hasAnimationRan, { toggle }] = useBoolean(false);

  const { t } = useTranslation();
  const [value, setValue] = useSetupVaultType();
  const navigate = useAppNavigate();
  const theme = useTheme();
  const { RiveComponent, rive } = useRive({
    src: '/assets/animations/choose-vault/index.riv',
    autoplay: true,
    stateMachines: [STATE_MACHINE_NAME],
  });

  const stateMachineInput = useStateMachineInput(
    rive,
    STATE_MACHINE_NAME,
    STATE_INPUT_NAME
  );

  const onStart = useCallback(() => {
    navigate(
      match(value, {
        fast: () => 'setupFastVault',
        secure: () => 'setupSecureVault',
      })
    );
  }, [navigate, value]);

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
                    <ShieldCheckIcon
                      color={
                        value === 'fast'
                          ? theme.colors.contrast.toCssValue()
                          : theme.colors.success.toCssValue()
                      }
                    />
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
              selected={value}
              onChange={newValue => {
                setValue(newValue);
                if (!hasAnimationRan) {
                  stateMachineInput?.fire();
                  toggle();
                }
              }}
            />
          </div>
          <DescriptionWrapper alignItems="flex-start">
            <DescriptionTitleWrapper>
              {value === 'fast' ? (
                <GradientText weight={500}>
                  {t(`${value}_vault_setup_title`)}
                </GradientText>
              ) : (
                <Text color="primary" weight={500}>
                  {t(`${value}_vault_setup_title`)}
                </Text>
              )}
            </DescriptionTitleWrapper>
            <DescriptionContentWrapper>
              {getSetupVaultProperties(value).map(prop => (
                <HStack key={prop} alignItems="center" gap={6}>
                  <IconWrapper>
                    <CheckIcon />
                  </IconWrapper>
                  <Text size={14} weight="600" color="contrast">
                    {t(prop)}
                  </Text>
                </HStack>
              ))}
            </DescriptionContentWrapper>
          </DescriptionWrapper>
          <ConfirmButton type="submit">{t('next')}</ConfirmButton>
        </ContentWrapper>
      </PageContent>
    </>
  );
};

const LightningGradientIconWrapper = styled.div`
  position: relative;
  font-size: 24px;
  margin-top: -1px;
`;

export const LightningIconWrapper = styled.div`
  font-size: 20px;
  margin-right: 3px;
`;
