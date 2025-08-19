import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { getBlockExplorerUrl } from '@core/chain/utils/getBlockExplorerUrl'
import { fromCommCoin } from '@core/mpc/types/utils/commCoin'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { useTxHash } from '@core/ui/chain/state/txHash'
import { TxOverviewMemo } from '@core/ui/chain/tx/TxOverviewMemo'
import { useKeysignMessagePayload } from '@core/ui/mpc/keysign/state/keysignMessagePayload'
import { KeysignTxFee } from '@core/ui/mpc/keysign/tx/components/KeysignTxFee'
import { TxOverviewAmount } from '@core/ui/mpc/keysign/tx/TxOverviewAmount'
import { useCore } from '@core/ui/state/core'
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
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export const KeysignTxOverview = () => {
  const { t } = useTranslation()
  const { openUrl } = useCore()
  const { name } = useCurrentVault()
  const payload = useKeysignMessagePayload()
  const {
    toAddress,
    memo,
    toAmount,
    coin: potentialCoin,
  } = getRecordUnionValue(payload, 'keysign')
  const coin = fromCommCoin(shouldBePresent(potentialCoin))
  const { address, chain, decimals } = shouldBePresent(coin)

  const formattedToAmount = useMemo(() => {
    if (!toAmount) return null

    return fromChainAmount(BigInt(toAmount), decimals)
  }, [toAmount, decimals])

  const txHash = useTxHash()

  const blockExplorerUrl = getBlockExplorerUrl({
    chain,
    entity: 'tx',
    value: txHash,
  })

  return (
    <>
      {formattedToAmount !== null && (
        <TxOverviewAmount amount={formattedToAmount} value={coin} />
      )}
      <Panel>
        <SeparatedByLine gap={16}>
          <HStack alignItems="center" gap={4} justifyContent="space-between">
            <Text color="shy" weight="500">
              {t('tx_hash')}
            </Text>
            <HStack alignItems="center" gap={4}>
              <Text>
                <MiddleTruncate text={txHash} width={140} />
              </Text>
              <IconButton onClick={() => openUrl(blockExplorerUrl)}>
                <SquareArrowOutUpRightIcon />
              </IconButton>
            </HStack>
          </HStack>
          <HStack alignItems="center" gap={4} justifyContent="space-between">
            <Text color="shy" weight="500">
              {t('from')}
            </Text>
            <HStack alignItems="center" gap={4}>
              <Text>{name}</Text>
              <Text color="shy" weight="500">
                <MiddleTruncate text={`(${address})`} width={80} />
              </Text>
            </HStack>
          </HStack>
          {toAddress && (
            <VStack gap={4}>
              <Text color="shy" weight="500">
                {t('to')}
              </Text>
              <Text>{toAddress}</Text>
            </VStack>
          )}
          {memo && <TxOverviewMemo value={memo} />}
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
          <KeysignTxFee />
        </SeparatedByLine>
      </Panel>
    </>
  )
}
