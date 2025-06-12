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
import { HStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { ValueProp } from '@lib/ui/props'
import { MiddleTruncate } from '@lib/ui/truncate'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { formatWalletAddress } from '@lib/utils/formatWalletAddress'
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
      <List>
        <ListItem
          description={<MiddleTruncate text={txHash} />}
          extra={
            <IconButton onClick={() => openUrl(blockExplorerUrl)}>
              <SquareArrowOutUpRightIcon />
            </IconButton>
          }
          title={t('tx_hash')}
        />
        <ListItem
          description={`${name} (${formatWalletAddress(vaultCoin.address)})`}
          title={t('from')}
        />
        {toAddress && (
          <ListItem
            description={<MiddleTruncate text={toAddress} />}
            title={t('to')}
          />
        )}
        {memo && <TxOverviewMemo value={memo} />}
        <ListItem
          description={
            <HStack alignItems="center" gap={4}>
              <ChainEntityIcon
                value={getChainLogoSrc(chain)}
                style={{ fontSize: 16 }}
              />
              {chain}
            </HStack>
          }
          title={t('network')}
        />
        {networkFeesFormatted ? (
          <ListItem
            description={networkFeesFormatted}
            title={t('est_network_fee')}
          />
        ) : null}
      </List>
    </>
  )
}
