import { getKeygenThreshold } from '@core/mpc/getKeygenThreshold'
import { OnForwardProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { range } from '@lib/utils/array/range'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { getFormProps } from '../../../../lib/ui/form/utils/getFormProps'
import { QueryBasedQrCode } from '../../../../lib/ui/qr/QueryBasedQrCode'
import { InitiatingDevice } from '../../../../mpc/peers/InitiatingDevice'
import { PeerOption } from '../../../../mpc/peers/option/PeerOption'
import { PeerDiscoveryFormFooter } from '../../../../mpc/peers/PeerDiscoveryFormFooter'
import { PeerPlaceholder } from '../../../../mpc/peers/PeerPlaceholder'
import { PeersContainer } from '../../../../mpc/peers/PeersContainer'
import { PeersManagerFrame } from '../../../../mpc/peers/PeersManagerFrame'
import { PeersManagerTitle } from '../../../../mpc/peers/PeersManagerTitle'
import { PeersPageContentFrame } from '../../../../mpc/peers/PeersPageContentFrame'
import { MpcLocalServerIndicator } from '../../../../mpc/serverType/MpcLocalServerIndicator'
import { useMpcServerType } from '../../../../mpc/serverType/state/mpcServerType'
import { FitPageContent } from '../../../../ui/page/PageContent'
import { PageFormFrame } from '../../../../ui/page/PageFormFrame'
import { PageHeader } from '../../../../ui/page/PageHeader'
import { PageHeaderBackButton } from '../../../../ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '../../../../ui/page/PageHeaderTitle'
import { CurrentPeersCorrector } from '../../../keygen/shared/peerDiscovery/CurrentPeersCorrector'
import { usePeerOptionsQuery } from '../../../keygen/shared/peerDiscovery/queries/usePeerOptionsQuery'
import { useCurrentVault } from '../../../state/currentVault'
import { useJoinKeysignUrlQuery } from '../../shared/queries/useJoinKeysignUrlQuery'
import { DownloadKeysignQrCode } from './DownloadKeysignQrCode'
import { useIsPeerDiscoveryStepDisabled } from './hooks/useIsPeerDiscoveryStepDisabled'

export const KeysignPeerDiscoveryStep = ({ onForward }: OnForwardProp) => {
  const { t } = useTranslation()

  const isDisabled = useIsPeerDiscoveryStepDisabled()

  useEffect(() => {
    if (!isDisabled) {
      onForward()
    }
  }, [isDisabled, onForward])

  const joinUrlQuery = useJoinKeysignUrlQuery()

  const [serverType] = useMpcServerType()

  const { signers } = useCurrentVault()

  const requiredSigners = getKeygenThreshold(signers.length)
  const requiredPeers = requiredSigners - 1

  const peerOptionsQuery = usePeerOptionsQuery()

  return (
    <>
      <CurrentPeersCorrector />
      <PageHeader
        title={<PageHeaderTitle>{t('scan_qr')}</PageHeaderTitle>}
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={<DownloadKeysignQrCode />}
      />
      <FitPageContent
        as="form"
        {...getFormProps({
          onSubmit: onForward,
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
                              {t('scanWithDevice', {
                                deviceNumber: index + peerOptions.length + 1,
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
