import { getKeygenThreshold } from '@core/mpc/getKeygenThreshold'
import { KeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import { MpcPeersCorrector } from '@core/ui/mpc/devices/MpcPeersCorrector'
import { InitiatingDevice } from '@core/ui/mpc/devices/peers/InitiatingDevice'
import { PeerOption } from '@core/ui/mpc/devices/peers/option/PeerOption'
import { PeerDiscoveryFormFooter } from '@core/ui/mpc/devices/peers/PeerDiscoveryFormFooter'
import { PeerPlaceholder } from '@core/ui/mpc/devices/peers/PeerPlaceholder'
import { PeersContainer } from '@core/ui/mpc/devices/peers/PeersContainer'
import { PeersManagerFrame } from '@core/ui/mpc/devices/peers/PeersManagerFrame'
import { PeersManagerTitle } from '@core/ui/mpc/devices/peers/PeersManagerTitle'
import { PeersPageContentFrame } from '@core/ui/mpc/devices/peers/PeersPageContentFrame'
import { useMpcPeerOptionsQuery } from '@core/ui/mpc/devices/queries/useMpcPeerOptionsQuery'
import { DownloadKeysignQrCode } from '@core/ui/mpc/keysign/DownloadKeysignQrCode'
import { useJoinKeysignUrlQuery } from '@core/ui/mpc/keysign/queries/useJoinKeysignUrlQuery'
import { MpcLocalServerIndicator } from '@core/ui/mpc/server/MpcLocalServerIndicator'
import { useMpcServerType } from '@core/ui/mpc/state/mpcServerType'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { FitPageContent } from '@lib/ui/page/PageContent'
import { PageFormFrame } from '@lib/ui/page/PageFormFrame'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { QueryBasedQrCode } from '@lib/ui/qr/QueryBasedQrCode'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { range } from '@lib/utils/array/range'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { useMpcPeers } from '../../state/mpcPeers'

type KeysignPeerDiscoveryStepProps = {
  payload: KeysignMessagePayload
  onFinish: (peers: string[]) => void
}

export const KeysignPeerDiscoveryStep = ({
  onFinish,
  payload,
}: KeysignPeerDiscoveryStepProps) => {
  const { t } = useTranslation()

  const peers = useMpcPeers()
  const { signers } = useCurrentVault()
  const [{ scanUnavailable }] = useCoreViewState<'keysign'>()

  const isDisabled = useMemo(() => {
    const requiredDevicesNumber = getKeygenThreshold(signers.length)

    const requiredPeersNumber = requiredDevicesNumber - 1
    if (peers.length < requiredPeersNumber) {
      return t('select_n_devices', { count: requiredPeersNumber })
    }
  }, [peers.length, signers.length, t])

  useEffect(() => {
    if (!isDisabled) {
      onFinish(peers)
    }
  }, [isDisabled, onFinish, peers])

  const joinUrlQuery = useJoinKeysignUrlQuery(payload)

  const [serverType] = useMpcServerType()

  const requiredSigners = getKeygenThreshold(signers.length)
  const requiredPeers = requiredSigners - 1

  const peerOptionsQuery = useMpcPeerOptionsQuery()

  return (
    <>
      <MpcPeersCorrector />
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={<DownloadKeysignQrCode />}
        title={t('scan_qr')}
        hasBorder
      />
      <FitPageContent>
        <PageFormFrame>
          <PeersPageContentFrame>
            <QueryBasedQrCode value={joinUrlQuery} />
            {scanUnavailable ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '8px 12px',
                  backgroundColor: 'var(--color-alertWarning)',
                  borderRadius: '16px',
                  marginBottom: 4,
                }}
              >
                <TriangleAlertIcon color="danger" fontSize={14} />
                <Text color="contrast" size={12} weight="500">
                  {t('security_scan_unavailable')}
                </Text>
              </div>
            ) : null}
            <PeersManagerFrame>
              {serverType === 'local' && <MpcLocalServerIndicator />}
              <PeersManagerTitle target={requiredSigners} />
              <PeersContainer>
                <InitiatingDevice />
                <MatchQuery
                  value={peerOptionsQuery}
                  success={peerOptions => {
                    return (
                      <>
                        {peerOptions.map(value => (
                          <PeerOption key={value} value={value} />
                        ))}
                        {range(requiredPeers - peerOptions.length).map(
                          index => (
                            <PeerPlaceholder key={index}>
                              {t('scan_with_device_index', {
                                index: index + peerOptions.length + 1,
                              })}
                            </PeerPlaceholder>
                          )
                        )}
                      </>
                    )
                  }}
                />
              </PeersContainer>
            </PeersManagerFrame>
          </PeersPageContentFrame>
          <PeerDiscoveryFormFooter isDisabled={isDisabled} />
        </PageFormFrame>
      </FitPageContent>
    </>
  )
}
