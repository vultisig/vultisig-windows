import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { formatFee } from '@core/chain/tx/fee/format/formatFee'
import { getBlockExplorerUrl } from '@core/chain/utils/getBlockExplorerUrl'
import { fromCommCoin } from '@core/mpc/types/utils/commCoin'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { TxOverviewMemo } from '@core/ui/chain/tx/TxOverviewMemo'
import { TxOverviewAmount } from '@core/ui/mpc/keysign/tx/TxOverviewAmount'
import { useCore } from '@core/ui/state/core'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { SquareArrowOutUpRightIcon } from '@lib/ui/icons/SquareArrowOutUpRightIcon'
import { SeparatedByLine } from '@lib/ui/layout/SeparatedByLine'
import { HStack } from '@lib/ui/layout/Stack'
import { Panel } from '@lib/ui/panel/Panel'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { MiddleTruncate } from '@lib/ui/truncate'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export const KeysignTxOverview = ({
  value,
  txHash,
}: ValueProp<KeysignPayload> & {
  txHash: string
}) => {
  const { t } = useTranslation()
  const { openUrl } = useCore()
  const { name } = useCurrentVault()
  const {
    coin: potentialCoin,
    toAddress,
    memo,
    toAmount,
    blockchainSpecific,
  } = value
  const coin = fromCommCoin(shouldBePresent(potentialCoin))
  const vaultCoin = useCurrentVaultCoin(coin)
  const { chain, decimals } = shouldBePresent(coin)

  const formattedToAmount = useMemo(() => {
    if (!toAmount) return null

    return fromChainAmount(BigInt(toAmount), decimals)
  }, [toAmount, decimals])

  const networkFeesFormatted = useMemo(() => {
    if (!blockchainSpecific.value) return null

    return formatFee({
      chain: chain as Chain,
      chainSpecific: blockchainSpecific,
    })
  }, [blockchainSpecific, chain])

  const blockExplorerUrl = getBlockExplorerUrl({
    chain,
    entity: 'tx',
    value: txHash,
  })

  return (
    <>
      {formattedToAmount && (
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
                <MiddleTruncate text={`(${vaultCoin.address})`} width={80} />
              </Text>
            </HStack>
          </HStack>
          {toAddress && (
            <HStack alignItems="center" gap={4} justifyContent="space-between">
              <Text color="shy" weight="500">
                {t('to')}
              </Text>
              <Text>
                <MiddleTruncate text={toAddress} width={200} />
              </Text>
            </HStack>
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
          {networkFeesFormatted && (
            <HStack alignItems="center" gap={4} justifyContent="space-between">
              <Text color="shy" weight="500">
                {t('est_network_fee')}
              </Text>
              <Text>{networkFeesFormatted}</Text>
            </HStack>
          )}
        </SeparatedByLine>
      </Panel>
    </>
  )
}
