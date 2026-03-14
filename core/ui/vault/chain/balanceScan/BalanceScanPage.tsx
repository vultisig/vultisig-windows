import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { ProgressLine } from '@lib/ui/flow/ProgressLine'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const idleValue = '—'

const ResetAction = styled(Text)`
  cursor: pointer;
  align-self: center;
`

type BalanceScanMetric = {
  title: string
  extra: ReactNode
}

type BalanceScanPageProps = {
  title?: string
  error: string | null
  loading: boolean
  birthHeight: number | null
  scanHeight: number | null
  syncTarget: number | null
  chainTip?: number | null
  metrics: BalanceScanMetric[]
  onReset?: (() => void | Promise<void>) | null
  footer?: ReactNode
}

export const BalanceScanPage = ({
  title,
  error,
  loading,
  birthHeight,
  scanHeight,
  syncTarget,
  chainTip = null,
  metrics,
  onReset,
  footer,
}: BalanceScanPageProps) => {
  const { t } = useTranslation()
  const detailMessage = error ?? null

  const scanStartHeight = birthHeight ?? scanHeight ?? syncTarget ?? null
  const scanStartHeightLabel = scanStartHeight?.toLocaleString() ?? idleValue
  const chainTipLabel = (chainTip ?? syncTarget)?.toLocaleString() ?? idleValue
  const scanProgressValue =
    scanHeight != null &&
    syncTarget != null &&
    scanStartHeight != null &&
    syncTarget >= scanStartHeight
      ? syncTarget === scanStartHeight
        ? scanHeight >= syncTarget
          ? 1
          : 0
        : Math.max(
            0,
            Math.min(
              1,
              (scanHeight - scanStartHeight) / (syncTarget - scanStartHeight)
            )
          )
      : 0
  const showProgressBar = syncTarget != null && scanHeight != null
  const scanProgressPercent = Math.round(scanProgressValue * 100)

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={title ?? t('finalise_balance_scan')}
        hasBorder
      />
      <PageContent gap={20} scrollable>
        {detailMessage && (
          <Text color={error ? 'danger' : 'shy'} size={14}>
            {detailMessage}
          </Text>
        )}

        {showProgressBar && (
          <VStack gap={4}>
            <Text size={48} weight={200} style={{ textAlign: 'center' }}>
              {scanProgressPercent}%
            </Text>
            <ProgressLine value={scanProgressValue} />
            <HStack justifyContent="space-between" alignItems="flex-start">
              <VStack gap={2}>
                <Text color="shy" size={11}>
                  {t('birthday')}
                </Text>
                <Text color="shy" size={11}>
                  {scanStartHeightLabel}
                </Text>
              </VStack>
              <VStack gap={2} alignItems="flex-end">
                <Text color="shy" size={11}>
                  {t('chain_tip')}
                </Text>
                <Text color="shy" size={11}>
                  {chainTipLabel}
                </Text>
              </VStack>
            </HStack>
          </VStack>
        )}

        <List border="gradient" radius={16}>
          {metrics.map(({ title, extra }) => (
            <ListItem
              key={title}
              hoverable={false}
              title={title}
              extra={extra}
            />
          ))}
        </List>

        {loading && (
          <HStack gap={12} alignItems="center">
            <Spinner size={20} />
            <Text color="shy">{t('loading')}</Text>
          </HStack>
        )}

        {!loading && onReset && (
          <ResetAction color="danger" size={14} weight={500} onClick={onReset}>
            {t('reset_sync')}
          </ResetAction>
        )}
      </PageContent>
      {footer ? <PageFooter>{footer}</PageFooter> : null}
    </>
  )
}
