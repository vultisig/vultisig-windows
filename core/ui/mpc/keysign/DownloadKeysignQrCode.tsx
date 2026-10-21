import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { SaveAsImage } from '@core/ui/file/SaveAsImage'
import { useJoinKeysignUrlQuery } from '@core/ui/mpc/keysign/queries/useJoinKeysignUrlQuery'
import { ShareKeysignQrCodeDialog } from '@core/ui/mpc/keysign/ShareKeysignQrCodeDialog'
import {
  PrintableQrCode,
  PrintableQrCodeRow,
} from '@core/ui/qr/PrintableQrCode'
import { useCore } from '@core/ui/state/core'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Opener } from '@lib/ui/base/Opener'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { FileUpIcon } from '@lib/ui/icons/FileUpIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { KeysignMessagePayload } from '@vultisig/core-mpc/keysign/keysignPayload/KeysignMessagePayload'
import { fromCommCoin } from '@vultisig/core-mpc/types/utils/commCoin'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { formatWalletAddress } from '@vultisig/lib-utils/formatWalletAddress'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'
import { useTranslation } from 'react-i18next'

import { currentProductBrandConfig } from '../../product/brand'
import { getVaultExportUid } from '../../vault/export/core/uid'

/**
 * Header control on the secure keysign pairing screen for handing the join QR
 * to a co-signer. The extension opens a share dialog with Copy Link and Share
 * QR Image; the desktop app saves the branded QR PNG straight away.
 */
export const DownloadKeysignQrCode = ({
  value: keysignPayload,
}: ValueProp<KeysignMessagePayload>) => {
  const joinKeysignUrlQuery = useJoinKeysignUrlQuery(keysignPayload)
  const { t } = useTranslation()
  const { client } = useCore()
  const vault = useCurrentVault()
  const { name } = vault

  const rows: PrintableQrCodeRow[] = [{ label: t('vault'), value: name }]

  matchRecordUnion(keysignPayload, {
    keysign: payload => {
      if (payload.toAmount && payload.toAmount !== '0' && payload.coin) {
        const coin = fromCommCoin(payload.coin)
        const amountText = formatAmount(
          fromChainAmount(BigInt(payload.toAmount), coin.decimals),
          { precision: 'high' }
        )
        rows.push({
          label: t('amount'),
          value: (
            <HStack gap={4} alignItems="center">
              <CoinIcon coin={coin} style={{ fontSize: 16 }} />
              <Text size={12} weight={500} color="regular" height={1.333}>
                {`${amountText} ${coin.ticker}`}
              </Text>
            </HStack>
          ),
        })
      }

      if (payload.toAddress) {
        rows.push({
          label: t('to'),
          value: formatWalletAddress(payload.toAddress),
        })
      }
    },
    custom: () => {},
  })

  return (
    <MatchQuery
      value={joinKeysignUrlQuery}
      success={data => (
        <SaveAsImage
          fileName={`VaultKeysignQR-${name}-${getVaultExportUid(vault).slice(-3)}`}
          renderTrigger={({ onClick: saveImage }) => (
            <Opener
              renderOpener={({ onOpen }) => (
                <IconButton
                  onClick={client === 'extension' ? onOpen : saveImage}
                >
                  <FileUpIcon />
                </IconButton>
              )}
              renderContent={({ onClose }) => (
                <ShareKeysignQrCodeDialog
                  joinUrl={data}
                  onSaveImage={saveImage}
                  onClose={onClose}
                />
              )}
            />
          )}
          value={
            <PrintableQrCode
              value={data}
              title={t('join_keysign')}
              brandLabel={currentProductBrandConfig.name}
              rows={rows}
            />
          }
        />
      )}
      pending={() => null}
      error={() => null}
    />
  )
}
