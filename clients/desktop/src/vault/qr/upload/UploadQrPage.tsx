import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { Match } from '../../../lib/ui/base/Match'
import { useAppNavigate } from '../../../navigation/hooks/useAppNavigate'
import { useAppPathParams } from '../../../navigation/hooks/useAppPathParams'
import { useNavigateBack } from '../../../navigation/hooks/useNavigationBack'
import { FlowPageHeader } from '../../../ui/flow/FlowPageHeader'
import { PageContent } from '../../../ui/page/PageContent'
import { ScanQrView } from './ScanQrView'
import { UploadQrView } from './UploadQrView'

const uploadQrViews = ['scan', 'upload'] as const
type UploadQrView = (typeof uploadQrViews)[number]

export const UploadQrPage = () => {
  const { t } = useTranslation()
  const navigate = useAppNavigate()
  const [{ title = t('keysign') }] = useAppPathParams<'uploadQr'>()

  const goBack = useNavigateBack()

  const [view, setView] = useState<UploadQrView>('scan')

  const viewIndex = uploadQrViews.indexOf(view)

  const onScanSuccess = useCallback(
    (url: string) => {
      navigate('deeplink', { state: { url } })
    },
    [navigate]
  )

  return (
    <StyledPageContent>
      <FlowPageHeader
        onBack={
          viewIndex === 0 ? goBack : () => setView(uploadQrViews[viewIndex - 1])
        }
        title={title}
      />
      <Match
        value={view}
        scan={() => (
          <ScanQrView
            onUploadQrViewRequest={() => setView('upload')}
            onScanSuccess={onScanSuccess}
          />
        )}
        upload={() => <UploadQrView />}
      />
    </StyledPageContent>
  )
}

const StyledPageContent = styled(PageContent)`
  background-image: url('/assets/images/scanQRCodeBackground.png');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: 0% 40%;
`
