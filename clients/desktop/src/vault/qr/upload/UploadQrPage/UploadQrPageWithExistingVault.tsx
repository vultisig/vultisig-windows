import { coinKeyToString } from '@core/chain/coin/Coin'
import { useCorePathParams } from '@core/ui/navigation/hooks/useCorePathParams'
import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { Match } from '@lib/ui/base/Match'
import { FlowPageHeader } from '@lib/ui/flow/FlowPageHeader'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { StyledPageContent } from '@lib/ui/qr/upload/UploadQRPage/UploadQRPage.styled'
import { useToast } from '@lib/ui/toast/ToastProvider'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useAppNavigate } from '../../../../navigation/hooks/useAppNavigate'
import { ScanQrView } from '../ScanQrView'
import { UploadQrView } from '../UploadQrView'
import { useDeriveChainFromWalletAddress } from '../useDeriveChainFromWalletAddress'

const uploadQrViews = ['scan', 'upload'] as const
type UploadQrView = (typeof uploadQrViews)[number]

export const UploadQrPageWithExistingVault = () => {
  const { t } = useTranslation()
  const navigate = useAppNavigate()
  const [{ title = t('keysign') }] = useCorePathParams<'uploadQr'>()
  const coins = useCurrentVaultCoins()
  const { addToast } = useToast()
  const goBack = useNavigateBack()

  const [view, setView] = useState<UploadQrView>('scan')
  const deriveChainFromWalletAddress = useDeriveChainFromWalletAddress()

  const viewIndex = uploadQrViews.indexOf(view)

  const onScanSuccess = useCallback(
    (value: string) => {
      const isURL = value.startsWith('http')

      if (isURL) {
        navigate('deeplink', { state: { url: value } })
        return
      }

      const chain = deriveChainFromWalletAddress(value)
      const coin = coins.find(coin => coin.chain === chain)

      if (coin) {
        navigate('send', {
          params: { coin: coinKeyToString(coin), address: value },
        })
      } else {
        addToast({
          message: t('coin_not_found_in_current_vault'),
        })
      }
    },
    [addToast, coins, deriveChainFromWalletAddress, navigate, t]
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
