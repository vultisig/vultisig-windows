import { SaveAsImage } from '@core/ui/file/SaveAsImage'
import { ShareVaultCard } from '@core/ui/vault/share/ShareVaultCard'
import { getVaultPublicKeyExport } from '@core/ui/vault/share/utils/getVaultPublicKeyExport'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Button } from '@lib/ui/button'
import { ShareIcon } from '@lib/ui/icons/ShareIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { getColor } from '@lib/ui/theme/getters'
import { toPng } from 'html-to-image'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const StyledIcon = styled(ShareIcon)`
  color: ${getColor('backgroundPrimary')};
`

export const ShareVaultPage = () => {
  const { t } = useTranslation()
  const vault = useCurrentVault()
  const { uid } = getVaultPublicKeyExport(vault)
  const lastThreeUID = uid.slice(-3)

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
        title={<PageHeaderTitle>{t('share_vault_qr')}</PageHeaderTitle>}
      />
      <PageContent alignItems="center" gap={40}>
        <VStack fullWidth alignItems="center" justifyContent="center" flexGrow>
          <div ref={qrNodeRef}>
            <ShareVaultCard />
          </div>
        </VStack>
        <VStack gap={8} fullWidth>
          <Button
            icon={<StyledIcon fontSize={20} />}
            label={t('vault_qr_share')}
            onClick={shareQrImage}
          />

          <SaveAsImage
            fileName={`VaultQR-${name}-${lastThreeUID}`}
            renderTrigger={({ onClick }) => (
              <Button label={t('save')} onClick={onClick} type="secondary" />
            )}
            value={<ShareVaultCard />}
          />
        </VStack>
      </PageContent>
    </VStack>
  )
}
