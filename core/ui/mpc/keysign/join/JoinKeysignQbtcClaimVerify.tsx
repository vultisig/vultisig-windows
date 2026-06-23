import { TxOverviewPanel } from '@core/ui/chain/tx/TxOverviewPanel'
import {
  TxOverviewChainDataRow,
  TxOverviewRow,
} from '@core/ui/chain/tx/TxOverviewRow'
import { VStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { useTranslation } from 'react-i18next'

/**
 * Verify screen shown to a secure-vault co-signer for a QBTC claim. Every value
 * is read straight from the pairing QR: the Bitcoin address and decimals from
 * `coin`, the QBTC recipient from `toAddress`, and the claimed total (base
 * units) from `toAmount`. (The signature itself is still recomputed from this
 * device's own vault, so these display values can't redirect the signing.)
 */
export const JoinKeysignQbtcClaimVerify = ({
  value,
}: ValueProp<KeysignPayload>) => {
  const { t } = useTranslation()

  const coin = shouldBePresent(value.coin, 'QBTC claim coin')

  const claimedAmount = formatAmount(
    fromChainAmount(BigInt(value.toAmount), coin.decimals),
    { precision: 'high' }
  )

  return (
    <VStack gap={16}>
      <VStack gap={8}>
        <Text size={18} weight="600" color="contrast">
          {t('qbtc_claim_cosign_title')}
        </Text>
        <Text size={14} color="supporting">
          {t('qbtc_claim_cosign_description')}
        </Text>
      </VStack>
      <TxOverviewPanel>
        <TxOverviewRow>
          <span>{t('qbtc_claim_cosign_amount')}</span>
          <span>{`${claimedAmount} QBTC`}</span>
        </TxOverviewRow>
        <TxOverviewChainDataRow>
          <span>{t('qbtc_claim_cosign_btc_address')}</span>
          <span>{coin.address}</span>
        </TxOverviewChainDataRow>
        <TxOverviewChainDataRow>
          <span>{t('qbtc_claim_cosign_qbtc_address')}</span>
          <span>{value.toAddress}</span>
        </TxOverviewChainDataRow>
      </TxOverviewPanel>
    </VStack>
  )
}
