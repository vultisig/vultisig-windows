import { useRive } from '@rive-app/react-canvas';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Match } from '../../../../lib/ui/base/Match';
import { Button } from '../../../../lib/ui/buttons/Button';
import { getFormProps } from '../../../../lib/ui/form/utils/getFormProps';
import { useBoolean } from '../../../../lib/ui/hooks/useBoolean';
import { CloseIcon } from '../../../../lib/ui/icons/CloseIcon';
import { CloudOffIcon } from '../../../../lib/ui/icons/CloudOffIcon';
import { InfoIcon } from '../../../../lib/ui/icons/InfoIcon';
import { HStack, VStack } from '../../../../lib/ui/layout/Stack';
import { TakeWholeSpaceCenterContent } from '../../../../lib/ui/layout/TakeWholeSpaceCenterContent';
import { Spinner } from '../../../../lib/ui/loaders/Spinner';
import {
  IsDisabledProp,
  OnBackProp,
  OnForwardProp,
} from '../../../../lib/ui/props';
import { MatchQuery } from '../../../../lib/ui/query/components/MatchQuery';
import { Query } from '../../../../lib/ui/query/Query';
import { GradientText, Text } from '../../../../lib/ui/text';
import { PageHeader } from '../../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../../ui/page/PageHeaderTitle';
import { StrictText } from '../../../deposit/DepositVerify/DepositVerify.styled';
import { CurrentPeersCorrector } from '../../../keygen/shared/peerDiscovery/CurrentPeersCorrector';
import { DownloadKeygenQrCode } from '../../../keygen/shared/peerDiscovery/DownloadKeygenQrCode';
import { KeygenPeerDiscoveryQrCode } from '../../../keygen/shared/peerDiscovery/KeygenPeerDiscoveryQrCode';
import { usePeerOptionsQuery } from '../../../keygen/shared/peerDiscovery/queries/usePeerOptionsQuery';
import { useCurrentServerType } from '../../../keygen/state/currentServerType';
import { SecureVaultPeerOption } from '../SecureVaultPeerOption';
import {
  BottomItemsWrapper,
  CloseIconWrapper,
  CloudOffWrapper,
  ContentWrapper,
  InfoIconWrapper,
  InfoIconWrapperForBanner,
  LocalPillWrapper,
  OverlayContent,
  OverlayContentWrapper,
  OverlayWrapper,
  PageWrapper,
  PhoneImageOverlay,
  PhoneImageWrapper,
  PillPlaceholder,
  PillWrapper,
  RiveWrapper,
  SwitchModeButton,
  SwitchModeWrapper,
} from './SecureVaultKeygenPeerDiscoveryStep.styles';

type KeygenPeerDiscoveryStepProps = OnForwardProp &
  Partial<OnBackProp> &
  IsDisabledProp & {
    joinUrlQuery: Query<string>;
    currentDevice: string;
  };

const QR_CODE_LINK =
  'https://docs.vultisig.com/vultisig-user-actions/creating-a-vault';

export const SecureVaultKeygenPeerDiscoveryStep = ({
  onForward,
  onBack,
  isDisabled,
  joinUrlQuery,
  currentDevice,
}: KeygenPeerDiscoveryStepProps) => {
  const { RiveComponent } = useRive({
    src: '/assets/animations/keygen-secure-vault/pulse.riv',
    autoplay: true,
  });
  const [overlayShown, setHasShownOverlay] = useState(true);
  const [serverType, setServerType] = useCurrentServerType();
  const isLocalServerType = serverType === 'local';
  const [showWarning, { toggle }] = useBoolean(true);
  const { t } = useTranslation();
  const queryResult = usePeerOptionsQuery();
  const peers = queryResult.data || [];
  const displayedDevices = [currentDevice, ...peers];
  const shouldShowOptional = displayedDevices.length === 3;
  const numberOfItems = shouldShowOptional ? 4 : 3;

  while (displayedDevices.length < numberOfItems) {
    displayedDevices.push('');
  }

  return (
    <>
      <PageHeader
        title={<PageHeaderTitle>{t('scan_qr')}</PageHeaderTitle>}
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        secondaryControls={
          <MatchQuery
            value={joinUrlQuery}
            success={value => (
              <HStack gap={12} alignItems="center">
                <InfoIconWrapper
                  href={QR_CODE_LINK}
                  target="_blank"
                  referrerPolicy="no-referrer"
                >
                  <InfoIcon />
                </InfoIconWrapper>
                <DownloadKeygenQrCode value={value} />
              </HStack>
            )}
            error={() => null}
            pending={() => null}
          />
        }
      />
      <PageWrapper
        as="form"
        {...getFormProps({
          onSubmit: onForward,
          isDisabled,
        })}
        justifyContent="space-between"
      >
        <VStack justifyContent="center" alignItems="center" gap={40}>
          <MatchQuery
            value={joinUrlQuery}
            success={value => <KeygenPeerDiscoveryQrCode value={value} />}
            pending={() => (
              <TakeWholeSpaceCenterContent>
                <Spinner />
              </TakeWholeSpaceCenterContent>
            )}
            error={() => (
              <TakeWholeSpaceCenterContent>
                <StrictText>{t('failed_to_generate_qr_code')}</StrictText>
              </TakeWholeSpaceCenterContent>
            )}
          />
          <ContentWrapper gap={24} alignItems="center">
            <Match
              value={isLocalServerType ? 'local' : 'relay'}
              local={() => (
                <LocalPillWrapper alignItems="baseline">
                  <CloudOffWrapper>
                    <CloudOffIcon />
                  </CloudOffWrapper>
                  <Text size={13} weight={500} color="shy">
                    {t('localMode')}
                  </Text>
                </LocalPillWrapper>
              )}
              relay={() =>
                showWarning ? (
                  <PillWrapper gap={12} alignItems="baseline">
                    <InfoIconWrapperForBanner>
                      <InfoIcon />
                    </InfoIconWrapperForBanner>
                    <Text weight={500} color="shy" size={13}>
                      {t('scanQrInstruction')}
                    </Text>
                    <CloseIconWrapper
                      role="button"
                      tabIndex={0}
                      onClick={toggle}
                    >
                      <CloseIcon />
                    </CloseIconWrapper>
                  </PillWrapper>
                ) : (
                  <PillPlaceholder />
                )
              }
            />
            <VStack gap={24}>
              <Text color="contrast" size={22} weight="500">
                {t('devicesStatus', {
                  currentPeers: peers.length + 1,
                })}
              </Text>
              <CurrentPeersCorrector />
              <HStack gap={48} wrap="wrap">
                {displayedDevices.map((device, index) => (
                  <SecureVaultPeerOption
                    shouldShowOptionalDevice={shouldShowOptional}
                    deviceNumber={index}
                    isCurrentDevice={index === 0}
                    key={index}
                    value={device}
                  />
                ))}
              </HStack>
            </VStack>
          </ContentWrapper>
        </VStack>
        <BottomItemsWrapper gap={8}>
          <Button kind="primary" type="submit" isDisabled={isDisabled}>
            {isDisabled ? t('waitingOnDevices') : t('next')}
          </Button>
          <SwitchModeWrapper>
            {serverType === 'local' ? (
              <Text as="div" color="shy" size={12} weight={500}>
                <SwitchModeButton
                  onClick={() =>
                    setServerType(isLocalServerType ? 'relay' : 'local')
                  }
                >
                  {t('switchToInternet')}
                </SwitchModeButton>
              </Text>
            ) : (
              <Text color="shy" size={12} weight={500}>
                {t('signPrivately')}{' '}
                <SwitchModeButton
                  onClick={() =>
                    setServerType(isLocalServerType ? 'relay' : 'local')
                  }
                >
                  {t('switchToLocal')}
                </SwitchModeButton>
              </Text>
            )}
          </SwitchModeWrapper>
        </BottomItemsWrapper>
        {overlayShown && (
          <OverlayWrapper justifyContent="flex-end">
            <OverlayContent alignItems="center">
              <OverlayContentWrapper justifyContent="center" gap={36}>
                <PhoneImageWrapper>
                  <PhoneImageOverlay />
                  <img src="/assets/images/vultisig-peak.svg" alt="" />
                  <RiveWrapper>
                    <RiveComponent />
                  </RiveWrapper>
                </PhoneImageWrapper>
                <VStack gap={12} justifyContent="center">
                  <Text
                    centerHorizontally
                    size={32}
                    weight={500}
                    color="contrast"
                  >
                    {t('scanThe')}{' '}
                    <GradientText as="span">{t('qrCode')}</GradientText>
                  </Text>
                  <Text
                    centerHorizontally
                    size={14}
                    weight={500}
                    color="contrast"
                  >
                    {t('downloadVultisig')}
                  </Text>
                </VStack>
                <Button onClick={() => setHasShownOverlay(false)}>
                  {t('next')}
                </Button>
              </OverlayContentWrapper>
            </OverlayContent>
          </OverlayWrapper>
        )}
      </PageWrapper>
    </>
  );
};
