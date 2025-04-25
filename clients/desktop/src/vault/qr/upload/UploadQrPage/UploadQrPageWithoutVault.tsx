import { useCorePathParams } from '@core/ui/navigation/hooks/useCorePathParams'
import { Match } from '@lib/ui/base/Match'
import { FlowPageHeader } from '@lib/ui/flow/FlowPageHeader'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { StyledPageContent } from '@lib/ui/qr/upload/UploadQRPage/UploadQRPage.styled'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useAppNavigate } from '../../../../navigation/hooks/useAppNavigate'
import { ScanQrView } from '../ScanQrView'
import { UploadQrView } from '../UploadQrView'

const uploadQrViews = ['scan', 'upload'] as const
type UploadQrView = (typeof uploadQrViews)[number]

export const UploadQrPageWithoutVault = () => {
  const { t } = useTranslation()
  const navigate = useAppNavigate()
  const [{ title = t('keysign') }] = useCorePathParams<'uploadQr'>()

  const goBack = useNavigateBack()

  const [view, setView] = useState<UploadQrView>('scan')

  const viewIndex = uploadQrViews.indexOf(view)

  const onScanSuccess = useCallback(
    (value: string) => {
      navigate('deeplink', { state: { url: value } })
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
