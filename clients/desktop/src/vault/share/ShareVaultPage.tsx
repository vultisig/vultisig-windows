import { Button } from '@lib/ui/buttons/Button'
import ShareIcon from '@lib/ui/icons/ShareIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { toPng } from 'html-to-image'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { SaveAsImage } from '../../ui/file/SaveAsImage'
import { PageContent } from '../../ui/page/PageContent'
import { PageHeader } from '../../ui/page/PageHeader'
import { PageHeaderBackButton } from '../../ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '../../ui/page/PageHeaderTitle'
import { useCurrentVault } from '../state/currentVault'
import { ShareVaultCard } from './ShareVaultCard'
import { getVaultPublicKeyExport } from './utils/getVaultPublicKeyExport'

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
          <Button onClick={shareQrImage} kind="primary">
            <HStack gap={4} alignItems="center">
              <ShareIcon strokeColor="#02132B" />{' '}
              <span>{t('vault_qr_share')}</span>
            </HStack>
          </Button>

          <SaveAsImage
            fileName={`VaultQR-${name}-${lastThreeUID}`}
            renderTrigger={({ onClick }) => (
              <Button kind="outlined" onClick={onClick}>
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
