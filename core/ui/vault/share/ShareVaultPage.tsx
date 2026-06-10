import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { ShareVaultCard } from '@core/ui/vault/share/ShareVaultCard'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { getColor } from '@lib/ui/theme/getters'
import { toPng } from 'html-to-image'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { SaveAsImage } from '../../file/SaveAsImage'
import { getVaultExportUid } from '../export/core/uid'
import { ShareBanner } from './ShareBanner'

const StyledButton = styled(Button)`
  background-color: ${getColor('foregroundExtra')};
`

export const ShareVaultPage = () => {
  const { t } = useTranslation()
  const vault = useCurrentVault()

  const { name } = vault
  const qrNodeRef = useRef<HTMLDivElement | null>(null)

  const shareQrImage = async () => {
    const node = qrNodeRef.current
    if (node) {
      try {
        const dataUrl = await toPng(node)
        const blob = await (await fetch(dataUrl)).blob()
        const file = new File([blob], `${name}.png`, { type: 'image/png' })

        // Share only the file — some targets (e.g. Telegram) drop the image
        // when title/text are also present and send just the text.
        const shareData = { files: [file] }

        if (navigator.canShare?.(shareData)) {
          await navigator.share(shareData)
        } else {
          // Web Share with files is unsupported (e.g. Chrome on Linux);
          // fall back to downloading the QR image.
          const link = document.createElement('a')
          link.href = dataUrl
          link.download = `${name}.png`
          link.click()
        }
      } catch (error) {
        console.error('Error sharing image:', error)
      }
    }
  }

  return (
    <VStack flexGrow>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={t('share_vault_qr')}
      />
      <PageContent alignItems="center" gap={40}>
        <VStack fullWidth alignItems="center" justifyContent="center" flexGrow>
          <div ref={qrNodeRef}>
            <ShareVaultCard />
          </div>
        </VStack>
        <VStack gap={15} fullWidth>
          <ShareBanner />
          <VStack gap={13}>
            <Button size="sm" onClick={shareQrImage}>
              {t('vault_qr_share')}
            </Button>
            <SaveAsImage
              fileName={`VaultQR-${name}-${getVaultExportUid(vault).slice(-3)}`}
              renderTrigger={({ onClick }) => (
                <StyledButton size="sm" kind="secondary" onClick={onClick}>
                  {t('save')}
                </StyledButton>
              )}
              value={<ShareVaultCard />}
            />
          </VStack>
        </VStack>
      </PageContent>
    </VStack>
  )
}
