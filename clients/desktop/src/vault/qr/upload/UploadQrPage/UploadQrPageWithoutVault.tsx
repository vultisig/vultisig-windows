import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Match } from '../../../../lib/ui/base/Match'
import { useAppNavigate } from '../../../../navigation/hooks/useAppNavigate'
import { useAppPathParams } from '../../../../navigation/hooks/useAppPathParams'
import { useNavigateBack } from '../../../../navigation/hooks/useNavigationBack'
import { FlowPageHeader } from '../../../../ui/flow/FlowPageHeader'
import { ScanQrView } from '../ScanQrView'
import { UploadQrView } from '../UploadQrView'
import { StyledPageContent } from './UploadQRPage.styled'

const uploadQrViews = ['scan', 'upload'] as const
type UploadQrView = (typeof uploadQrViews)[number]

export const UploadQrPageWithoutVault = () => {
  const { t } = useTranslation()
  const navigate = useAppNavigate()
  const [{ title = t('keysign') }] = useAppPathParams<'uploadQr'>()

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
