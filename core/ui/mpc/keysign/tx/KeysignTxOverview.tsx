import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { useTxHash } from '@core/ui/chain/state/txHash'
import { TxOverviewMemo } from '@core/ui/chain/tx/TxOverviewMemo'
import { useKeysignMessagePayload } from '@core/ui/mpc/keysign/state/keysignMessagePayload'
import { TxOverviewAmount } from '@core/ui/mpc/keysign/tx/TxOverviewAmount'
import { getSignDataTxAction } from '@core/ui/mpc/keysign/tx/utils/getSignDataTxAction'
import { useCore } from '@core/ui/state/core'
import { useAddressBookNameForAddress } from '@core/ui/vault/hooks/useAddressBookNameForAddress'
import { useVaultNameForAddress } from '@core/ui/vault/hooks/useVaultNameForAddress'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { SquareArrowOutUpRightIcon } from '@lib/ui/icons/SquareArrowOutUpRightIcon'
import { SeparatedByLine } from '@lib/ui/layout/SeparatedByLine'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Panel } from '@lib/ui/panel/Panel'
import { Text } from '@lib/ui/text'
import { MiddleTruncate } from '@lib/ui/truncate'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { isChainOfKind } from '@vultisig/core-chain/ChainKind'
import { getBlockExplorerUrl } from '@vultisig/core-chain/utils/getBlockExplorerUrl'
import { fromCommCoin } from '@vultisig/core-mpc/types/utils/commCoin'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { match } from '@vultisig/lib-utils/match'
import { getRecordUnionValue } from '@vultisig/lib-utils/record/union/getRecordUnionValue'
import { useTranslation } from 'react-i18next'

import { useTxStatusQuery } from '../../../chain/tx/status/useTxStatusQuery'
import { AddToAddressBookButton } from './components/AddToAddressBookButton'
import { TxActualFeeDisplay } from './components/TxActualFeeDisplay'
import { TxFeeRow } from './components/TxFeeRow'
import { KeysignFeeAmount } from './FeeAmount'
import { parseSuiTx } from './sui/parser'
import { SignSuiDisplay } from './sui/SignSuiDisplay'

type KeysignTxOverviewProps = {
  toAddressLabel?: string
  // When rendered directly beneath the success hero (which already shows the
  // amount and tx hash), hide those rows here to avoid duplication.
  hideAmount?: boolean
  hideTxHash?: boolean
}

export const KeysignTxOverview = ({
  toAddressLabel,
  hideAmount = false,
  hideTxHash = false,
}: KeysignTxOverviewProps) => {
  const { t } = useTranslation()
  const { openUrl } = useCore()
  const { name } = useCurrentVault()
  const keysignPayload = getRecordUnionValue(
    useKeysignMessagePayload(),
    'keysign'
  )
  const { toAddress, memo, toAmount, coin: potentialCoin } = keysignPayload
  const coin = fromCommCoin(shouldBePresent(potentialCoin))
  const { address, chain, decimals } = shouldBePresent(coin)

  const formattedToAmount = toAmount
    ? fromChainAmount(BigInt(toAmount), decimals)
    : null

  const txAction = getSignDataTxAction(keysignPayload, formattedToAmount ?? 0)

  const showAmountOrAction =
    formattedToAmount !== null ||
    (txAction !== null && txAction.action !== 'send')

  const toVaultName = useVaultNameForAddress({
    address: toAddress ?? '',
    chain,
  })
  const toAddressBookName = useAddressBookNameForAddress({
    address: toAddress ?? '',
    chain,
  })
  const toLabel = toVaultName ?? toAddressBookName ?? toAddressLabel ?? null
  const txHash = useTxHash()
  const txStatusQuery = useTxStatusQuery({ chain, hash: txHash })
  const receipt = txStatusQuery.data?.receipt

  // Signing already succeeded by the time this overview renders, so the tx is
  // at least "Signed". When it was broadcast, surface the on-chain outcome once
  // it resolves (parity with Android's receipt Status row).
  const statusLabel = keysignPayload.skipBroadcast
    ? t('tx_status_signed')
    : match(txStatusQuery.data?.status ?? 'pending', {
        success: () => t('tx_status_confirmed'),
        error: () => t('tx_status_failed'),
        pending: () => t('tx_status_signed'),
        not_found: () => t('tx_status_signed'),
      })
  const statusColor =
    !keysignPayload.skipBroadcast && txStatusQuery.data?.status === 'error'
      ? 'danger'
      : 'primary'

  const blockExplorerUrl = getBlockExplorerUrl({
    chain,
    entity: 'tx',
    value: txHash,
  })

  const suiTxData =
    keysignPayload.signData.case === 'signSui'
      ? parseSuiTx(keysignPayload.signData.value.unsignedTxMsg)
      : null

  // EVM contract-call memos are long hex blobs best shown via the decoding
  // collapse; plain memos (e.g. THORChain) render inline beside the label.
  const isEvmContractMemo =
    isChainOfKind(chain, 'evm') &&
    !!memo &&
    memo.startsWith('0x') &&
    memo !== '0x'

  return (
    <>
      {showAmountOrAction && !hideAmount && (
        <TxOverviewAmount
          amount={
            txAction && 'amount' in txAction && txAction.amount !== undefined
              ? txAction.amount
              : (formattedToAmount ?? 0)
          }
          value={coin}
          actionLabel={
            txAction?.action !== 'send' ? txAction?.labelKey : undefined
          }
        />
      )}
      {suiTxData && <SignSuiDisplay data={suiTxData} />}
      <Panel>
        <SeparatedByLine gap={16}>
          {!keysignPayload.skipBroadcast && !hideTxHash && (
            <HStack alignItems="center" gap={4} justifyContent="space-between">
              <Text color="shy" weight="500">
                {t('tx_hash')}
              </Text>
              <HStack alignItems="center" gap={4}>
                <MiddleTruncate text={txHash} width={140} />
                <IconButton onClick={() => openUrl(blockExplorerUrl)}>
                  <SquareArrowOutUpRightIcon />
                </IconButton>
              </HStack>
            </HStack>
          )}
          <HStack alignItems="center" gap={4} justifyContent="space-between">
            <Text color="shy" weight="500">
              {t('status')}
            </Text>
            <Text color={statusColor} weight="500">
              {statusLabel}
            </Text>
          </HStack>
          <HStack alignItems="center" gap={4} justifyContent="space-between">
            <Text color="shy" weight="500">
              {t('from')}
            </Text>
            <HStack alignItems="center" gap={4}>
              <Text>{name}</Text>
              <MiddleTruncate
                color="textShy"
                text={`(${address})`}
                weight={500}
                width={80}
              />
            </HStack>
          </HStack>
          {toAddress && (
            <VStack gap={8}>
              <HStack
                alignItems="center"
                gap={8}
                justifyContent="space-between"
                wrap="nowrap"
              >
                <Text color="shy" weight="500">
                  {t('to')}
                </Text>
                {toLabel !== null ? (
                  <HStack alignItems="center" gap={4}>
                    <Text>{toLabel}</Text>
                    <MiddleTruncate
                      color="textShy"
                      text={`(${toAddress})`}
                      weight={500}
                      width={80}
                    />
                  </HStack>
                ) : (
                  <MiddleTruncate text={toAddress} weight={500} width={160} />
                )}
              </HStack>
              <HStack justifyContent="flex-end">
                <AddToAddressBookButton address={toAddress} chain={chain} />
              </HStack>
            </VStack>
          )}
          {memo &&
            (isEvmContractMemo ? (
              <TxOverviewMemo value={memo} chain={chain} />
            ) : (
              <HStack
                alignItems="flex-start"
                gap={16}
                justifyContent="space-between"
                wrap="nowrap"
              >
                <Text color="shy" weight="500">
                  {t('memo')}
                </Text>
                <Text
                  color="primary"
                  family="mono"
                  size={14}
                  weight="700"
                  style={{
                    flex: 1,
                    minWidth: 0,
                    textAlign: 'right',
                    wordBreak: 'break-all',
                  }}
                >
                  {memo}
                </Text>
              </HStack>
            ))}
          {formattedToAmount !== null && (
            <HStack alignItems="center" gap={4} justifyContent="space-between">
              <Text color="shy" weight="500">
                {t('amount')}
              </Text>
              <Text weight="500">{`${formattedToAmount} ${coin.ticker}`}</Text>
            </HStack>
          )}
          <HStack alignItems="center" gap={4} justifyContent="space-between">
            <Text color="shy" weight="500">
              {t('network')}
            </Text>
            <HStack alignItems="center" gap={4}>
              <ChainEntityIcon
                value={getChainLogoSrc(chain)}
                style={{ fontSize: 16 }}
              />
              <Text>{chain}</Text>
            </HStack>
          </HStack>
          <TxFeeRow label={receipt ? t('network_fee') : t('est_network_fee')}>
            {receipt ? (
              <TxActualFeeDisplay chain={chain} receipt={receipt} />
            ) : (
              <KeysignFeeAmount keysignPayload={keysignPayload} />
            )}
          </TxFeeRow>
        </SeparatedByLine>
      </Panel>
    </>
  )
}
