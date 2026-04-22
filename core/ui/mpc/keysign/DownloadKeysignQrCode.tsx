import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { SaveAsImage } from '@core/ui/file/SaveAsImage'
import { useJoinKeysignUrlQuery } from '@core/ui/mpc/keysign/queries/useJoinKeysignUrlQuery'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import {
  PrintableQrCode,
  PrintableQrCodeRow,
} from '@core/ui/qr/PrintableQrCode'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { FileUpIcon } from '@lib/ui/icons/FileUpIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { fromCommCoin } from '@vultisig/core-mpc/types/utils/commCoin'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { formatWalletAddress } from '@vultisig/lib-utils/formatWalletAddress'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'
import { useTranslation } from 'react-i18next'

import { getVaultExportUid } from '../../vault/export/core/uid'

export const DownloadKeysignQrCode = () => {
  const [{ keysignPayload }] = useCoreViewState<'keysign'>()
  const joinKeysignUrlQuery = useJoinKeysignUrlQuery(keysignPayload)
  const { t } = useTranslation()
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
          renderTrigger={({ onClick }) => (
            <IconButton onClick={onClick}>
              <FileUpIcon />
            </IconButton>
          )}
          value={
            <PrintableQrCode
              value={data}
              title={t('join_keysign')}
              brandLabel={t('vultisig')}
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
