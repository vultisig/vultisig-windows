import { getBlockExplorerUrl } from '@core/chain/utils/getBlockExplorerUrl'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { useCore } from '@core/ui/state/core'
import { useTransactionRecords } from '@core/ui/storage/transactionHistory'
import {
  SendTransactionRecord,
  SwapTransactionRecord,
  TransactionRecordStatus,
} from '@core/ui/transaction-history/core'
import { TransactionHistoryTag } from '@core/ui/transaction-history/TransactionHistoryTag'
import { Button } from '@lib/ui/buttons/Button'
import { SquareArrowOutUpRightIcon } from '@lib/ui/icons/SquareArrowOutUpRightIcon'
import { ScreenLayout } from '@lib/ui/layout/ScreenLayout/ScreenLayout'
import { SeparatedByLine } from '@lib/ui/layout/SeparatedByLine'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { Panel } from '@lib/ui/panel/Panel'
import { Text, TextColor } from '@lib/ui/text'
import { MiddleTruncate } from '@lib/ui/truncate'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

const statusLabelKey = {
  broadcasted: 'broadcasted',
  pending: 'pending',
  confirmed: 'confirmed',
  failed: 'failed',
} as const satisfies Record<TransactionRecordStatus, string>

const statusColor: Record<TransactionRecordStatus, TextColor> = {
  broadcasted: 'idle',
  pending: 'idle',
  confirmed: 'success',
  failed: 'danger',
}

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

type DetailRowProps = {
  label: string
  children: ReactNode
}

const DetailRow = ({ label, children }: DetailRowProps) => (
  <HStack alignItems="center" gap={4} justifyContent="space-between">
    <Text color="shy" weight={500}>
      {label}
    </Text>
    {children}
  </HStack>
)

const SendAmountDisplay = ({ record }: { record: SendTransactionRecord }) => {
  const { data } = record

  return (
    <HStack alignItems="center" gap={8}>
      {data.tokenLogo && (
        <CoinIcon
          coin={{
            chain: record.chain,
            id: data.tokenId ?? '',
            logo: data.tokenLogo,
          }}
          style={{ fontSize: 32 }}
        />
      )}
      <VStack gap={2}>
        <Text size={20} weight={600}>
          {data.amount} {data.token}
        </Text>
        {record.fiatValue && (
          <Text size={14} color="shy">
            {record.fiatValue}
          </Text>
        )}
      </VStack>
    </HStack>
  )
}

const SendDetailPanel = ({ record }: { record: SendTransactionRecord }) => {
  const { t } = useTranslation()
  const { data } = record

  return (
    <Panel>
      <SeparatedByLine gap={12}>
        <DetailRow label={t('from')}>
          <MiddleTruncate text={data.fromAddress} width={160} />
        </DetailRow>
        <DetailRow label={t('to')}>
          <MiddleTruncate text={data.toAddress} width={160} />
        </DetailRow>
        {data.feeEstimate && (
          <DetailRow label={t('network_fee')}>
            <Text>{data.feeEstimate}</Text>
          </DetailRow>
        )}
        {data.memo && (
          <DetailRow label={t('memo')}>
            <Text>{data.memo}</Text>
          </DetailRow>
        )}
      </SeparatedByLine>
    </Panel>
  )
}

const SwapAmountDisplay = ({ record }: { record: SwapTransactionRecord }) => {
  const { data } = record

  return (
    <VStack gap={8} alignItems="center">
      <HStack alignItems="center" gap={8}>
        {data.fromTokenLogo && (
          <CoinIcon
            coin={{
              chain: data.fromChain,
              id: data.fromTokenId ?? '',
              logo: data.fromTokenLogo,
            }}
            style={{ fontSize: 32 }}
          />
        )}
        <Text size={20} weight={600}>
          {data.fromAmount} {data.fromToken}
        </Text>
      </HStack>
      <Text size={14} color="shy">
        →
      </Text>
      <HStack alignItems="center" gap={8}>
        {data.toTokenLogo && (
          <CoinIcon
            coin={{
              chain: data.toChain,
              id: data.toTokenId ?? '',
              logo: data.toTokenLogo,
            }}
            style={{ fontSize: 32 }}
          />
        )}
        <Text size={20} weight={600}>
          {data.toAmount} {data.toToken}
        </Text>
      </HStack>
    </VStack>
  )
}

const SwapDetailPanel = ({ record }: { record: SwapTransactionRecord }) => {
  const { t } = useTranslation()
  const { data } = record

  if (!data.provider) return null

  return (
    <Panel>
      <SeparatedByLine gap={12}>
        <DetailRow label={t('provider')}>
          <Text>{data.provider}</Text>
        </DetailRow>
      </SeparatedByLine>
    </Panel>
  )
}

export const TransactionDetailPage = () => {
  const goBack = useNavigateBack()
  const { t } = useTranslation()
  const [{ id }] = useCoreViewState<'transactionDetail'>()
  const { openUrl } = useCore()
  const records = useTransactionRecords()

  const record = shouldBePresent(
    records.find(r => r.id === id),
    'transaction record for detail view'
  )

  const explorerUrl =
    record.explorerUrl ||
    getBlockExplorerUrl({
      chain: record.chain,
      entity: 'tx',
      value: record.txHash,
    })

  return (
    <ScreenLayout title={t('transaction_details')} onBack={goBack}>
      <VStack gap={20} alignItems="center">
        <TransactionHistoryTag type={record.type} />

        {record.type === 'send' && (
          <>
            <SendAmountDisplay record={record} />
            <SendDetailPanel record={record} />
          </>
        )}

        {record.type === 'swap' && (
          <>
            <SwapAmountDisplay record={record} />
            <SwapDetailPanel record={record} />
          </>
        )}

        <Panel>
          <SeparatedByLine gap={12}>
            <DetailRow label={t('status')}>
              <Text color={statusColor[record.status]}>
                {t(statusLabelKey[record.status])}
              </Text>
            </DetailRow>
            <DetailRow label={t('date')}>
              <Text>{formatTimestamp(record.timestamp)}</Text>
            </DetailRow>
            <DetailRow label={t('network')}>
              <HStack alignItems="center" gap={4}>
                <ChainEntityIcon
                  value={getChainLogoSrc(record.chain)}
                  style={{ fontSize: 16 }}
                />
                <Text>{record.chain}</Text>
              </HStack>
            </DetailRow>
            <DetailRow label={t('tx_hash')}>
              <MiddleTruncate text={record.txHash} width={140} />
            </DetailRow>
          </SeparatedByLine>
        </Panel>

        <Button
          kind="secondary"
          onClick={() => openUrl(explorerUrl)}
          icon={<SquareArrowOutUpRightIcon />}
        >
          {t('view_on_explorer')}
        </Button>
      </VStack>
    </ScreenLayout>
  )
}
