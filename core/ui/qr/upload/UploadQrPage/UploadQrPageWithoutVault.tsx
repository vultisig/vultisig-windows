import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { ScanQrView } from '@core/ui/qr/ScanQrView'
import { Match } from '@lib/ui/base/Match'
import { FlowPageHeader } from '@lib/ui/flow/FlowPageHeader'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { StyledPageContent } from '@lib/ui/qr/upload/UploadQRPage/UploadQRPage.styled'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useCoreNavigate } from '../../../navigation/hooks/useCoreNavigate'
import { UploadQrView } from '../UploadQrView'

const uploadQrViews = ['scan', 'upload'] as const
type UploadQrViewType = (typeof uploadQrViews)[number]

export const UploadQrPageWithoutVault = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const [{ title = t('keysign') }] = useCoreViewState<'uploadQr'>()

  const goBack = useNavigateBack()

  const [view, setView] = useState<UploadQrViewType>('scan')

  const viewIndex = uploadQrViews.indexOf(view)

  const onScanSuccess = useCallback(
    (value: string) => {
      navigate({ id: 'deeplink', state: { url: value } })
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
            onFinish={onScanSuccess}
          />
        )}
        upload={() => <UploadQrView />}
      />
    </StyledPageContent>
  )
}
