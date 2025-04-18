import { getKeygenThreshold } from '@core/mpc/getKeygenThreshold'
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
import { MpcLocalServerIndicator } from '@core/ui/mpc/server/MpcLocalServerIndicator'
import { useMpcServerType } from '@core/ui/mpc/state/mpcServerType'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { FitPageContent } from '@lib/ui/page/PageContent'
import { PageFormFrame } from '@lib/ui/page/PageFormFrame'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { OnFinishProp } from '@lib/ui/props'
import { QueryBasedQrCode } from '@lib/ui/qr/QueryBasedQrCode'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { range } from '@lib/utils/array/range'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useJoinKeysignUrlQuery } from '../../shared/queries/useJoinKeysignUrlQuery'
import { DownloadKeysignQrCode } from './DownloadKeysignQrCode'
import { useIsPeerDiscoveryStepDisabled } from './hooks/useIsPeerDiscoveryStepDisabled'

export const KeysignPeerDiscoveryStep = ({ onFinish }: OnFinishProp) => {
  const { t } = useTranslation()

  const isDisabled = useIsPeerDiscoveryStepDisabled()

  useEffect(() => {
    if (!isDisabled) {
      onFinish()
    }
  }, [isDisabled, onFinish])

  const joinUrlQuery = useJoinKeysignUrlQuery()

  const [serverType] = useMpcServerType()

  const { signers } = useCurrentVault()

  const requiredSigners = getKeygenThreshold(signers.length)
  const requiredPeers = requiredSigners - 1

  const peerOptionsQuery = useMpcPeerOptionsQuery()

  return (
    <>
      <MpcPeersCorrector />
      <PageHeader
        title={<PageHeaderTitle>{t('scan_qr')}</PageHeaderTitle>}
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={<DownloadKeysignQrCode />}
      />
      <FitPageContent
        as="form"
        {...getFormProps({
          onSubmit: onFinish,
          isDisabled,
        })}
      >
        <PageFormFrame>
          <PeersPageContentFrame>
            <QueryBasedQrCode value={joinUrlQuery} />
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
