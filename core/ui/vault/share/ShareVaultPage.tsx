import { SaveAsImage } from '@core/ui/file/SaveAsImage'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { ShareVaultCard } from '@core/ui/vault/share/ShareVaultCard'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Button } from '@lib/ui/buttons/Button'
import { ShareIcon } from '@lib/ui/icons/ShareIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { getColor } from '@lib/ui/theme/getters'
import { toPng } from 'html-to-image'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { getVaultExportUid } from '../export/core/uid'

const StyledIcon = styled(ShareIcon)`
  color: ${getColor('background')};
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

        if (navigator.share) {
          await navigator.share({
            files: [file],
            title: t('vault_qr_share_title'),
            text: t('vault_qr_share_text'),
          })
        } else {
          alert(t('vault_qr_share_not_supported'))
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
        <VStack gap={8} fullWidth>
          <Button icon={<StyledIcon fontSize={20} />} onClick={shareQrImage}>
            {t('vault_qr_share')}
          </Button>

          <SaveAsImage
            fileName={`VaultQR-${name}-${getVaultExportUid(vault).slice(-3)}`}
            renderTrigger={({ onClick }) => (
              <Button kind="secondary" onClick={onClick}>
                {t('save')}
              </Button>
            )}
            value={<ShareVaultCard />}
          />
        </VStack>
      </PageContent>
    </VStack>
  )
}
