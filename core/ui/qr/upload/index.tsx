import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { ScanQrView } from '@core/ui/qr/components/ScanQrView'
import { UploadQrView } from '@core/ui/qr/components/UploadQrView'
import { useDeriveChainFromWalletAddress } from '@core/ui/qr/hooks/useDeriveChainFromWalletAddress'
import { useCurrentVaultId } from '@core/ui/storage/currentVaultId'
import { useVaults } from '@core/ui/storage/vaults'
import { Match } from '@lib/ui/base/Match'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { CircleInfoIcon } from '@lib/ui/icons/CircleInfoIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { useToast } from '@lib/ui/toast/ToastProvider'
import { Tooltip } from '@lib/ui/tooltips/Tooltip'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createGlobalStyle } from 'styled-components'

const PageGlobalStyle = createGlobalStyle`
  body {
    background-image: url('/core/images/qr-scanner-bg.jpg');
    background-size: cover;
    background-position: center;
    max-width: 100% !important;
  }
`

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
      <PageGlobalStyle />
      <VStack alignSelf="center" maxWidth={1024} fullHeight fullWidth>
        <PageHeader
          primaryControls={
            <PageHeaderBackButton
              onClick={view !== 'scan' ? () => setView('scan') : undefined}
            />
          }
          secondaryControls={
            <Tooltip
              content={
                <VStack gap={8} style={{ width: 300 }}>
                  <Text weight="700">{t('having_trouble_scanning')}</Text>
                  <Text>{t('having_trouble_scanning_desc')}</Text>
                  <VStack gap={4}>
                    {[
                      t('having_trouble_scanning_tip_1'),
                      t('having_trouble_scanning_tip_2'),
                      t('having_trouble_scanning_tip_3'),
                    ].map(tip => (
                      <HStack key={tip} gap={8} alignItems="flex-start">
                        <Text>•</Text>
                        <Text>{tip}</Text>
                      </HStack>
                    ))}
                  </VStack>
                </VStack>
              }
              placement="bottom-end"
              renderOpener={props => (
                <IconButton
                  aria-label={t('having_trouble_scanning_help')}
                  {...props}
                >
                  <CircleInfoIcon />
                </IconButton>
              )}
            />
          }
          title={title}
        />
        <Match
          value={view}
          scan={() => (
            <ScanQrView
              onUploadQrViewRequest={() => setView('upload')}
              onFinish={onScanSuccess}
            />
          )}
          upload={() => (
            <UploadQrView
              title={t('upload_qr_code_to_join_keysign')}
              onFinish={onScanSuccess}
            />
          )}
        />
      </VStack>
    </>
  )
}
