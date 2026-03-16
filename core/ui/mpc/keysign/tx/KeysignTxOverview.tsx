import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { getBlockExplorerUrl } from '@core/chain/utils/getBlockExplorerUrl'
import { fromCommCoin } from '@core/mpc/types/utils/commCoin'
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
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { useTranslation } from 'react-i18next'

import { useTxStatusQuery } from '../../../chain/tx/status/useTxStatusQuery'
import { AddToAddressBookButton } from './components/AddToAddressBookButton'
import { TxActualFeeDisplay } from './components/TxActualFeeDisplay'
import { TxFeeRow } from './components/TxFeeRow'
import { KeysignFeeAmount } from './FeeAmount'

type KeysignTxOverviewProps = {
  toAddressLabel?: string
}

export const KeysignTxOverview = ({
  toAddressLabel,
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

  const toVaultName = useVaultNameForAddress(toAddress ?? '', chain)
  const toAddressBookName = useAddressBookNameForAddress(toAddress ?? '', chain)
  const txHash = useTxHash()
  const txStatusQuery = useTxStatusQuery({ chain, hash: txHash })
  const receipt = txStatusQuery.data?.receipt

  const blockExplorerUrl = getBlockExplorerUrl({
    chain,
    entity: 'tx',
    value: txHash,
  })

  return (
    <>
      {showAmountOrAction && (
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
          contractAddress={
            txAction?.action === 'contract_execution' &&
            'contractAddress' in txAction
              ? txAction.contractAddress
              : undefined
          }
        />
      )}
      <Panel>
        <SeparatedByLine gap={16}>
          {!keysignPayload.skipBroadcast && (
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
                {(() => {
                  const label =
                    toVaultName ?? toAddressBookName ?? toAddressLabel ?? null
                  return label !== null ? (
                    <HStack alignItems="center" gap={4}>
                      <Text>{label}</Text>
                      <MiddleTruncate
                        color="textShy"
                        text={`(${toAddress})`}
                        weight={500}
                        width={80}
                      />
                    </HStack>
                  ) : (
                    <MiddleTruncate text={toAddress} weight={500} width={160} />
                  )
                })()}
              </HStack>
              <HStack justifyContent="flex-end">
                <AddToAddressBookButton address={toAddress} chain={chain} />
              </HStack>
            </VStack>
          )}
          {memo && <TxOverviewMemo value={memo} chain={chain} />}
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
