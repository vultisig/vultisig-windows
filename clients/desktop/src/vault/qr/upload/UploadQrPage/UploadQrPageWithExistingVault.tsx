import { coinKeyToString } from '@core/chain/coin/Coin'
import { match } from '@lib/utils/match'
import { pipe } from '@lib/utils/pipe'
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
      pipe(
        value,
        val => ({
          isURL: val.startsWith('http'),
          chain: deriveChainFromWalletAddress(val),
          value: val,
        }),
        ({ isURL, chain, value }) =>
          match(isURL ? 'url' : chain ? 'coin' : 'unknown', {
            url: () => navigate('deeplink', { state: { url: value } }),
            coin: () => {
              const coin = coins.find(c => c.chain === chain)
              return coin
                ? navigate('send', {
                    params: { coin: coinKeyToString(coin), address: value },
                  })
                : addToast({ message: t('chain_not_found_in_current_vault') })
            },
            unknown: () =>
              addToast({ message: t('chain_not_found_in_current_vault') }),
          })
      )
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
