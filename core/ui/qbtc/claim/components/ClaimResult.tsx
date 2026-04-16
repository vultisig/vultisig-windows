import { Button } from '@lib/ui/buttons/Button'
import { CircleCheckIcon } from '@lib/ui/icons/CircleCheckIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Panel } from '@lib/ui/panel/Panel'
import { Text } from '@lib/ui/text'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { useTranslation } from 'react-i18next'

const btcDecimals = 8

type ClaimResultProps = {
  totalAmountClaimed: bigint
  utxosClaimed: number
  utxosSkipped: number
  txHash: string
  onDone: () => void
}

/** Success screen summarising a completed QBTC claim. */
export const ClaimResult = ({
  totalAmountClaimed,
  utxosClaimed,
  utxosSkipped,
  txHash,
  onDone,
}: ClaimResultProps) => {
  const { t } = useTranslation()

  const totalBtc = Number(totalAmountClaimed) / 10 ** btcDecimals
  const truncatedHash = `${txHash.slice(0, 10)}…${txHash.slice(-8)}`

  return (
    <VStack gap={24} alignItems="center" style={{ paddingTop: 24 }}>
      <VStack alignItems="center" gap={12}>
        <Text color="primary" style={{ fontSize: 48 }}>
          <CircleCheckIcon />
        </Text>
        <Text color="contrast" size={18} weight="600">
          {t('qbtc_claim_success_title')}
        </Text>
        <Text color="primary" size={24} weight="700">
          {formatAmount(totalBtc, { precision: 'high' })} QBTC
        </Text>
      </VStack>

      <Panel style={{ width: '100%' }}>
        <VStack gap={12}>
          <HStack fullWidth justifyContent="space-between">
            <Text color="supporting" size={12}>
              {t('qbtc_claim_utxos_claimed')}
            </Text>
            <Text color="contrast" size={12}>
              {utxosClaimed}
            </Text>
          </HStack>
          <HStack fullWidth justifyContent="space-between">
            <Text color="supporting" size={12}>
              {t('qbtc_claim_utxos_skipped')}
            </Text>
            <Text color="contrast" size={12}>
              {utxosSkipped}
            </Text>
          </HStack>
          <HStack fullWidth justifyContent="space-between">
            <Text color="supporting" size={12}>
              {t('qbtc_claim_tx_hash')}
            </Text>
            <Text color="contrast" size={12} family="mono">
              {truncatedHash}
            </Text>
          </HStack>
        </VStack>
      </Panel>

      <Button kind="primary" onClick={onDone}>
        {t('qbtc_claim_done')}
      </Button>
    </VStack>
  )
}
