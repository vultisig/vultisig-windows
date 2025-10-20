import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { ScanQrView } from '@core/ui/qr/components/ScanQrView'
import { UploadQrView } from '@core/ui/qr/components/UploadQrView'
import { useDeriveChainFromWalletAddress } from '@core/ui/qr/hooks/useDeriveChainFromWalletAddress'
import { useCurrentVaultId } from '@core/ui/storage/currentVaultId'
import { useVaults } from '@core/ui/storage/vaults'
import { getVaultId } from '@core/ui/vault/Vault'
import { Match } from '@lib/ui/base/Match'
import { VStack } from '@lib/ui/layout/Stack'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { useToast } from '@lib/ui/toast/ToastProvider'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

export const UploadQrPage = () => {
  const { t } = useTranslation()
  const [{ title = t('keysign') }] = useCoreViewState<'uploadQr'>()
  const [view, setView] = useState<'scan' | 'upload'>('scan')
  const { addToast } = useToast()
  const currentVaultId = useCurrentVaultId()
  const vault = useVaults().find(vault => getVaultId(vault) === currentVaultId)
  const deriveChainFromWalletAddress = useDeriveChainFromWalletAddress()
  const navigate = useCoreNavigate()

  const onScanSuccess = useCallback(
    (value: string) => {
      if (vault) {
        const isURL = value.startsWith('http')

        if (isURL) {
          navigate({ id: 'deeplink', state: { url: value } })

          return
        }

        const chain = deriveChainFromWalletAddress(value)
        const coin = vault.coins.find(coin => coin.chain === chain)

        if (coin) {
          navigate({ id: 'send', state: { coin, address: value } })
        } else {
          addToast({ message: t('failed_to_read_qr_code') })
        }
      } else {
        navigate({ id: 'deeplink', state: { url: value } })
      }
    },
    [addToast, deriveChainFromWalletAddress, navigate, t, vault]
  )

  return (
    <>
      <VStack fullHeight>
        <PageHeader
          primaryControls={
            <PageHeaderBackButton
              onClick={view !== 'scan' ? () => setView('scan') : undefined}
            />
          }
          title={title}
          hasBorder
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
      </VStack>
    </>
  )
}
