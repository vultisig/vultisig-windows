import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '../../../../../lib/ui/buttons/Button'
import { getFormProps } from '../../../../../lib/ui/form/utils/getFormProps'
import { VStack } from '../../../../../lib/ui/layout/Stack'
import { OnForwardProp } from '../../../../../lib/ui/props'
import { FitPageContent } from '../../../../../ui/page/PageContent'
import { PageFormFrame } from '../../../../../ui/page/PageFormFrame'
import { PageHeader } from '../../../../../ui/page/PageHeader'
import { PageHeaderBackButton } from '../../../../../ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '../../../../../ui/page/PageHeaderTitle'
import { KeygenNetworkReminder } from '../../../../keygen/shared/KeygenNetworkReminder'
import { ManageServerType } from '../../../../keygen/shared/peerDiscovery/ManageServerType'
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
          <KeysignPeerDiscoveryQrCode />
          <VStack gap={40} alignItems="center">
            <ManageServerType />
            <KeysignPeersManager />
            <KeygenNetworkReminder />
          </VStack>
        </PageFormFrame>
        <Button type="submit" isDisabled={isDisabled}>
          {t('continue')}
        </Button>
      </FitPageContent>
    </>
  )
}
