import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { ScanQrView } from '@core/ui/qr/components/ScanQrView'
import { UploadQrView } from '@core/ui/qr/components/UploadQrView'
import { Match } from '@lib/ui/base/Match'
import { BodyPortal } from '@lib/ui/dom/BodyPortal'
import { useKeyDown } from '@lib/ui/hooks/useKeyDown'
import { VStack } from '@lib/ui/layout/Stack'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnCloseProp, OnFinishProp } from '@lib/ui/props'
import { getColor } from '@lib/ui/theme/getters'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type ScanQrModalProps = OnFinishProp<string> & OnCloseProp

/**
 * Full-screen QR scan/upload overlay matching the send-address scanner.
 * Rendered through a body portal above any open sheet so it works when
 * launched from inside another modal (e.g. the swap external-recipient sheet).
 */
export const ScanQrModal = ({ onFinish, onClose }: ScanQrModalProps) => {
  const { t } = useTranslation()
  const [qrView, setQrView] = useState<'scan' | 'upload'>('scan')

  useKeyDown('Escape', onClose)

  return (
    <BodyPortal>
      <Overlay>
        <PageHeader
          hasBorder
          title={qrView === 'upload' ? t('upload_qr_code_image') : t('scan_qr')}
          primaryControls={
            <PageHeaderBackButton
              onClick={qrView === 'upload' ? () => setQrView('scan') : onClose}
            />
          }
        />
        <Body>
          <Match
            value={qrView}
            scan={() => (
              <ScanQrView
                onFinish={onFinish}
                onUploadQrViewRequest={() => setQrView('upload')}
              />
            )}
            upload={() => (
              <UploadQrView
                title={t('upload_qr_code_with_address')}
                onFinish={onFinish}
              />
            )}
          />
        </Body>
      </Overlay>
    </BodyPortal>
  )
}

const Overlay = styled(VStack)`
  position: fixed;
  inset: 0;
  z-index: 1100;
  background: ${getColor('background')};
  isolation: isolate;
`

const Body = styled(VStack)`
  flex: 1;
  min-height: 0;
`
