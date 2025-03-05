import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { getFormProps } from '../../../../../lib/ui/form/utils/getFormProps'
import { VStack } from '../../../../../lib/ui/layout/Stack'
import { OnForwardProp } from '../../../../../lib/ui/props'
import { QueryBasedQrCode } from '../../../../../lib/ui/qr/QueryBasedQrCode'
import { PeerDiscoveryFormFooter } from '../../../../../mpc/peers/PeerDiscoveryFormFooter'
import { PeersManagerFrame } from '../../../../../mpc/peers/PeersManagerFrame'
import { PeersPageContentFrame } from '../../../../../mpc/peers/PeersPageContentFrame'
import { MpcLocalServerIndicator } from '../../../../../mpc/serverType/MpcLocalServerIndicator'
import { useMpcServerType } from '../../../../../mpc/serverType/state/mpcServerType'
import { FitPageContent } from '../../../../../ui/page/PageContent'
import { PageFormFrame } from '../../../../../ui/page/PageFormFrame'
import { PageHeader } from '../../../../../ui/page/PageHeader'
import { PageHeaderBackButton } from '../../../../../ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '../../../../../ui/page/PageHeaderTitle'
import { KeygenNetworkReminder } from '../../../../keygen/shared/KeygenNetworkReminder'
import { ManageServerType } from '../../../../keygen/shared/peerDiscovery/ManageServerType'
import { useJoinKeysignUrlQuery } from '../../../shared/queries/useJoinKeysignUrlQuery'
import { DownloadKeysignQrCode } from '../DownloadKeysignQrCode'
import { useIsPeerDiscoveryStepDisabled } from '../hooks/useIsPeerDiscoveryStepDisabled'
import { KeysignPeerDiscoveryQrCode } from '../KeysignPeerDiscoveryCode'
import { KeysignPeersManager } from './KeysignPeersManager'

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

  return (
    <>
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
            </PeersManagerFrame>
          </PeersPageContentFrame>
          <KeysignPeerDiscoveryQrCode />
          <VStack gap={40} alignItems="center">
            <ManageServerType />
            <KeysignPeersManager />
            <KeygenNetworkReminder />
          </VStack>
        </PageFormFrame>
        <PeerDiscoveryFormFooter isDisabled={isDisabled} />
      </FitPageContent>
    </>
  )
}
