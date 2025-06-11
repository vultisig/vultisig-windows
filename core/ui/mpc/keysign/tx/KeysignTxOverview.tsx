import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { formatFee } from '@core/chain/tx/fee/format/formatFee'
import { getBlockExplorerUrl } from '@core/chain/utils/getBlockExplorerUrl'
import { fromCommCoin } from '@core/mpc/types/utils/commCoin'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { TxOverviewMemo } from '@core/ui/chain/tx/TxOverviewMemo'
import { TxOverviewRow } from '@core/ui/chain/tx/TxOverviewRow'
import { TxOverviewAmount } from '@core/ui/mpc/keysign/tx/TxOverviewAmount'
import { useCore } from '@core/ui/state/core'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { SquareArrowOutUpRightIcon } from '@lib/ui/icons/SquareArrowOutUpRightIcon'
import { SeparatedByLine } from '@lib/ui/layout/SeparatedByLine'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { capitalizeFirstLetter } from '@lib/utils/capitalizeFirstLetter'
import { formatWalletAddress } from '@lib/utils/formatWalletAddress'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

export const KeysignTxOverview = ({
  value,
  txHash,
}: ValueProp<KeysignPayload> & {
  txHash: string
}) => {
  console.log('## value', value)
  const { t } = useTranslation()
  const {
    coin: potentialCoin,
    toAddress,
    memo,
    toAmount,
    blockchainSpecific,
  } = value

  const { openUrl } = useCore()
  const coin = fromCommCoin(shouldBePresent(potentialCoin))
  const vaultCoin = useCurrentVaultCoin(coin)
  const { decimals } = coin
  const { name } = useCurrentVault()

  const formattedToAmount = useMemo(() => {
    if (!toAmount) return null

    return fromChainAmount(BigInt(toAmount), decimals)
  }, [toAmount, decimals])

  const { chain } = shouldBePresent(coin)

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
    <VStack gap={16}>
      {formattedToAmount && (
        <TxOverviewAmount amount={formattedToAmount} value={coin} />
      )}
      <Content gap={16}>
        <VStack gap={16}>
          <HStack justifyContent="space-between" alignItems="center" gap={4}>
            <Text color="shy">{t('tx_hash')}</Text>
            <HStack alignItems="center" gap={4}>
              <Text
                style={{
                  maxWidth: '150px',
                }}
                cropped
              >
                {txHash}
              </Text>
              <IconButton
                onClick={() => {
                  openUrl(blockExplorerUrl)
                }}
              >
                <SquareArrowOutUpRightIcon />
              </IconButton>
            </HStack>
          </HStack>
        </VStack>
        <TxOverviewRow>
          <Text color="shy">{t('from')}</Text>
          <Text size={14}>
            {name}{' '}
            <RowValue size={14} as="span" color="shy">
              ({formatWalletAddress(vaultCoin.address)})
            </RowValue>
          </Text>
        </TxOverviewRow>
        {toAddress && (
          <TxOverviewRow>
            <Text color="shy">{t('to')}</Text>
            <RowValue>{toAddress}</RowValue>
          </TxOverviewRow>
        )}
        {memo && <TxOverviewMemo value={memo} />}
        <TxOverviewRow>
          <Text color="shy">{capitalizeFirstLetter(t('network'))}</Text>
          <HStack gap={8}>
            <ChainEntityIcon
              value={getChainLogoSrc(chain)}
              style={{ fontSize: 16 }}
            />
            <Text size={14}>{chain}</Text>
          </HStack>
        </TxOverviewRow>
        {networkFeesFormatted && (
          <TxOverviewRow>
            <Text color="shy">{t('est_network_fee')}</Text>
            <RowValue>{networkFeesFormatted}</RowValue>
          </TxOverviewRow>
        )}
      </Content>
    </VStack>
  )
}

const Content = styled(SeparatedByLine)`
  border-radius: 16px;
  padding: 16px;
  background-color: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};

  > * {
    font-size: 14px;
  }
`

const RowValue = styled(Text)`
  max-width: 100%;
`
