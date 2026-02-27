import { parseLocalPartyId } from '@core/mpc/devices/localPartyId'
import { formatMpcDeviceName } from '@core/mpc/devices/MpcDevice'
import { MpcServerType } from '@core/mpc/MpcServerType'
import { DownloadKeygenQrCode } from '@core/ui/mpc/keygen/qr/DownloadKeygenQrCode'
import { useCore } from '@core/ui/state/core'
import { Animation } from '@lib/ui/animations/Animation'
import { Match } from '@lib/ui/base/Match'
import { Button } from '@lib/ui/buttons/Button'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { centerContent } from '@lib/ui/css/centerContent'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { ChevronLeftIcon } from '@lib/ui/icons/ChevronLeftIcon'
import { DeviceIcon } from '@lib/ui/icons/DeviceIcon'
import { ShareIcon } from '@lib/ui/icons/ShareIcon'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { FitPageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Query } from '@lib/ui/query/Query'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import QRCode from 'react-qr-code'
import styled, { css } from 'styled-components'

const qrScaleDistance = 120
const minQrScale = 0.75

type SecureVaultPeerDiscoveryScreenProps = Partial<OnBackProp> &
  OnFinishProp & {
    isDisabled: string | undefined
    isLocalModeAvailable: boolean
    joinUrlQuery: Query<string>
    localPartyId: string
    missingDevicesCount: number
    onToggleServerType: () => void
    peerOptionsQuery: Query<string[]>
    serverType: MpcServerType
    targetDeviceCount: number
  }

export const SecureVaultPeerDiscoveryScreen = ({
  isDisabled,
  isLocalModeAvailable,
  joinUrlQuery,
  localPartyId,
  missingDevicesCount,
  onBack,
  onFinish,
  onToggleServerType,
  peerOptionsQuery,
  serverType,
  targetDeviceCount,
}: SecureVaultPeerDiscoveryScreenProps) => {
  const { goBack } = useCore()
  const { t } = useTranslation()

  const [scrollTop, setScrollTop] = useState(0)

  const qrScaleProgress = Math.min(scrollTop, qrScaleDistance) / qrScaleDistance
  const qrScale = 1 - qrScaleProgress * (1 - minQrScale)

  const localDeviceName = formatMpcDeviceName(
    parseLocalPartyId(localPartyId).deviceName
  )

  const connectedPeers = (peerOptionsQuery.data ?? []).slice(
    0,
    Math.max(targetDeviceCount - 1, 0)
  )
  const waitingPeersCount = Math.max(
    0,
    targetDeviceCount - 1 - connectedPeers.length
  )

  const shouldRenderDeviceCountCta = targetDeviceCount > 3

  return (
    <Root>
      <PageHeader
        primaryControls={
          <HeaderIconButton
            kind="secondary"
            size="lg"
            onClick={onBack ?? goBack}
          >
            <ChevronLeftIcon />
          </HeaderIconButton>
        }
        secondaryControls={
          <MatchQuery
            value={joinUrlQuery}
            success={value => (
              <DownloadKeygenQrCode
                value={value}
                iconButtonKind="secondary"
                iconButtonSize="lg"
              />
            )}
            pending={() => (
              <HeaderIconButton kind="secondary" size="lg" disabled>
                <ShareIcon />
              </HeaderIconButton>
            )}
            error={() => (
              <HeaderIconButton kind="secondary" size="lg" disabled>
                <ShareIcon />
              </HeaderIconButton>
            )}
          />
        }
      />
      <FitPageContent
        as="form"
        onScroll={event => setScrollTop(event.currentTarget.scrollTop)}
        {...getFormProps({ onSubmit: onFinish, isDisabled })}
      >
        <FormContent>
          <TopSection>
            <QrScaleContainer style={{ transform: `scale(${qrScale})` }}>
              <QrFrame $isLocalMode={serverType === 'local'}>
                <QrFrameInner>
                  <QrCodeContainer>
                    <MatchQuery
                      value={joinUrlQuery}
                      success={value => (
                        <QRCode
                          bgColor="#FFFFFF"
                          fgColor="#17325f"
                          style={{ height: '100%', width: '100%' }}
                          value={value}
                        />
                      )}
                      pending={() => <Spinner />}
                      error={() => (
                        <Text color="supporting" size={13} weight={500}>
                          {t('failed_to_generate_qr_code')}
                        </Text>
                      )}
                    />
                  </QrCodeContainer>
                </QrFrameInner>
              </QrFrame>
            </QrScaleContainer>
            <WaitingTitle>
              <Text
                color="contrast"
                size={17}
                weight={500}
                letterSpacing={-0.3}
              >
                {t(
                  serverType === 'local'
                    ? 'secureVaultPeerDiscovery.localModeWaiting'
                    : 'secureVaultPeerDiscovery.waitingForDevicesToConnect'
                )}
              </Text>
              <DotsIndicator>
                <Animation src="/core/animations/dots-indicator.riv" />
              </DotsIndicator>
            </WaitingTitle>
            <PeersList>
              <PeerCard $status="connected">
                <StatusIcon $status="connected">
                  <ThisDeviceIcon />
                </StatusIcon>
                <PeerInfo>
                  <Text color="contrast" size={14} weight={500}>
                    {localDeviceName}
                  </Text>
                  <Text color="success" variant="caption">
                    {t('this_device')}
                  </Text>
                </PeerInfo>
                <OrderBadge>
                  {t('secureVaultPeerDiscovery.devicePosition', {
                    current: 1,
                    total: targetDeviceCount,
                  })}
                </OrderBadge>
              </PeerCard>
              {connectedPeers.map((peer, index) => (
                <PeerCard key={peer} $status="connected">
                  <StatusIcon $status="connected">
                    <DeviceIcon />
                  </StatusIcon>
                  <PeerInfo>
                    <Text color="contrast" size={14} weight={500}>
                      {formatMpcDeviceName(parseLocalPartyId(peer).deviceName)}
                    </Text>
                  </PeerInfo>
                  <OrderBadge>
                    {t('secureVaultPeerDiscovery.devicePosition', {
                      current: index + 2,
                      total: targetDeviceCount,
                    })}
                  </OrderBadge>
                </PeerCard>
              ))}
              {Array.from({ length: waitingPeersCount }).map((_, index) => (
                <PeerCard key={index} $status="pending">
                  <StatusIcon $status="pending">
                    <Animation src="/core/animations/searching-device.riv" />
                  </StatusIcon>
                  <PeerInfo>
                    <Text
                      color="shyExtra"
                      size={13}
                      weight={500}
                      letterSpacing={0.06}
                    >
                      {t('secureVaultPeerDiscovery.waitingForDeviceToJoin')}
                    </Text>
                  </PeerInfo>
                  <OrderBadge>
                    {t('secureVaultPeerDiscovery.devicePosition', {
                      current: connectedPeers.length + index + 2,
                      total: targetDeviceCount,
                    })}
                  </OrderBadge>
                </PeerCard>
              ))}
            </PeersList>
            {shouldRenderDeviceCountCta && (
              <Button disabled={isDisabled} type="submit">
                {missingDevicesCount > 0
                  ? t('secureVaultPeerDiscovery.addAtLeastMoreDevices', {
                      count: missingDevicesCount,
                    })
                  : t('next')}
              </Button>
            )}
          </TopSection>
          {isLocalModeAvailable && (
            <ModeSection>
              <Match
                value={serverType}
                relay={() => (
                  <>
                    <ModePromptText as="p" color="shy">
                      {t('secureVaultPeerDiscovery.wantToCreateVaultPrivately')}
                    </ModePromptText>
                    <ModeToggleButton
                      kind="secondary"
                      size="sm"
                      onClick={onToggleServerType}
                      type="button"
                    >
                      {t('secureVaultPeerDiscovery.useLocalMode')}
                    </ModeToggleButton>
                  </>
                )}
                local={() => (
                  <>
                    <ModePromptText as="p" color="shy">
                      {t('secureVaultPeerDiscovery.notWantToUseLocal')}
                    </ModePromptText>
                    <ModeToggleButton
                      style={{
                        backgroundColor: '#0B4EFF',
                      }}
                      size="sm"
                      onClick={onToggleServerType}
                      type="button"
                    >
                      {t('secureVaultPeerDiscovery.useStandardMode')}
                    </ModeToggleButton>
                  </>
                )}
              />
            </ModeSection>
          )}
        </FormContent>
      </FitPageContent>
      <BottomFade />
    </Root>
  )
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
`

const ThisDeviceIcon = () => (
  <svg
    fill="none"
    height="15"
    viewBox="0 0 10 15"
    width="10"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      clipRule="evenodd"
      d="M1.83333 14.6667C0.820813 14.6667 0 13.8459 0 12.8333V1.83333C0 0.820813 0.820813 0 1.83333 0H7.5C8.51253 0 9.33333 0.820813 9.33333 1.83333V12.8333C9.33333 13.8459 8.51253 14.6667 7.5 14.6667H1.83333ZM3.83333 1.66C3.5572 1.66 3.33333 1.88386 3.33333 2.16C3.33333 2.43614 3.5572 2.66 3.83333 2.66H5.5C5.77613 2.66 6 2.43614 6 2.16C6 1.88386 5.77613 1.66 5.5 1.66H3.83333Z"
      fill="#1DC79B"
      fillRule="evenodd"
    />
  </svg>
)

const HeaderIconButton = styled(IconButton)`
  && {
    background-color: ${getColor('buttonSecondary')};
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: ${getColor('contrast')};
  }
`

const FormContent = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  min-height: 100%;
  width: min(100%, 345px);
`

const TopSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`

const QrScaleContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  transform-origin: top center;
  width: 100%;
`

const QrFrame = styled.div<{ $isLocalMode: boolean }>`
  border-radius: 33px;
  max-width: 297px;
  padding: 8px;
  transition: background-color 0.2s ease;
  width: 100%;

  ${({ $isLocalMode }) =>
    $isLocalMode
      ? css`
          background-color: ${getColor('foregroundExtra')};
        `
      : css`
          background: linear-gradient(180deg, #4879fd 0%, #0d39b1 100%);
        `}
`

const QrFrameInner = styled.div`
  background-color: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundSuper')};
  border-radius: 24px;
  padding: 16px;
`

const QrCodeContainer = styled.div`
  ${centerContent};
  aspect-ratio: 1;
  background-color: ${getColor('contrast')};
  border-radius: 16px;
  overflow: hidden;
  width: 100%;
`

const animationSize = css`
  > * {
    height: 100%;
    width: 100%;
  }

  canvas,
  svg {
    height: 100% !important;
    width: 100% !important;
  }
`

const WaitingTitle = styled.div`
  align-items: center;
  display: inline-flex;
  gap: 2px;
  justify-content: center;
`

const DotsIndicator = styled.div`
  flex-shrink: 0;
  height: 12px;
  width: 12px;
  align-self: flex-end;

  ${animationSize}
`

const PeersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const PeerCard = styled.div<{ $status: 'connected' | 'pending' }>`
  align-items: center;
  border-radius: 24px;
  display: flex;
  gap: 12px;
  min-height: 68px;
  padding: 16px;

  ${({ $status }) =>
    $status === 'connected'
      ? css`
          background-color: ${getColor('foreground')};
          border: 1px solid ${getColor('foregroundExtra')};
        `
      : css`
          background: rgba(6, 27, 58, 0.5);
          border: 1px dashed rgba(255, 255, 255, 0.03);
        `}
`

const StatusIcon = styled.div<{ $status: 'connected' | 'pending' }>`
  ${centerContent};
  border-radius: 50%;
  flex-shrink: 0;
  font-size: 16px;
  height: 32px;
  width: 32px;

  ${({ $status }) =>
    $status === 'connected'
      ? css`
          background: rgba(19, 200, 157, 0.12);
          border: 1px solid rgba(19, 200, 157, 0.45);
          color: ${getColor('primary')};
        `
      : css`
          background-color: ${getColor('foregroundDark')};
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: ${getColor('primaryAlt')};

          ${animationSize}
        `}
`

const PeerInfo = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`

const OrderBadge = styled.div`
  ${centerContent};
  background-color: ${getColor('foregroundExtra')};
  border-radius: 99px;
  color: ${getColor('textShyExtra')};
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 500;
  height: 36px;
  letter-spacing: 0.06px;
  min-width: 72px;
  padding: 0 12px;
  white-space: nowrap;
`

const ModeSection = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: auto;
  padding: 20px 0 12px;
  text-align: center;

  @media ${mediaQuery.tabletDeviceAndUp} {
    margin-top: revert;
  }
`

const ModePromptText = styled(Text)`
  text-align: center;
  font-size: 13px;
  font-style: normal;
  font-weight: 500;
  line-height: 18px;
  letter-spacing: 0.06px;
`

const ModeToggleButton = styled(Button)`
  width: 100%;
  max-width: fit-content;
  border-radius: 12px;
`

const BottomFade = styled.div`
  background: linear-gradient(180deg, rgba(2, 18, 43, 0) 0%, #02122b 100%);
  bottom: 0;
  height: 48px;
  left: 0;
  pointer-events: none;
  position: absolute;
  right: 0;
`
