import { coinKeyToString } from '@core/chain/coin/Coin'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Match } from '../../../../lib/ui/base/Match'
import { useToast } from '../../../../lib/ui/toast/ToastProvider'
import { useAppNavigate } from '../../../../navigation/hooks/useAppNavigate'
import { useAppPathParams } from '../../../../navigation/hooks/useAppPathParams'
import { useNavigateBack } from '../../../../navigation/hooks/useNavigationBack'
import { FlowPageHeader } from '../../../../ui/flow/FlowPageHeader'
import { useCurrentVaultCoins } from '../../../state/currentVault'
import { ScanQrView } from '../ScanQrView'
import { UploadQrView } from '../UploadQrView'
import { useDeriveChainFromWalletAddress } from '../useDeriveChainFromWalletAddress'
import { StyledPageContent } from './UploadQRPage.styled'

const uploadQrViews = ['scan', 'upload'] as const
type UploadQrView = (typeof uploadQrViews)[number]

export const UploadQrPageWithExistingVault = () => {
  const { t } = useTranslation()
  const navigate = useAppNavigate()
  const [{ title = t('keysign') }] = useAppPathParams<'uploadQr'>()
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
