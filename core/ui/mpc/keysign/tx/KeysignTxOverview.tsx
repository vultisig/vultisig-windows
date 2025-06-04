import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { formatFee } from '@core/chain/tx/fee/format/formatFee'
import { getBlockExplorerUrl } from '@core/chain/utils/getBlockExplorerUrl'
import { fromCommCoin } from '@core/mpc/types/utils/commCoin'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { TxOverviewMemo } from '@core/ui/chain/tx/TxOverviewMemo'
import { TxOverviewRow } from '@core/ui/chain/tx/TxOverviewRow'
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

import { ChainEntityIcon } from '../../../chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '../../../chain/metadata/getChainLogoSrc'
import { useCore } from '../../../state/core'
import { useCurrentVault } from '../../../vault/state/currentVault'
import { useCurrentVaultCoin } from '../../../vault/state/currentVaultCoins'
import { TxOverviewAmount } from './TxOverviewAmount'

export const KeysignTxOverview = ({
  value,
  txHash,
}: ValueProp<KeysignPayload> & {
  txHash: string
}) => {
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
                icon={<SquareArrowOutUpRightIcon />}
              />
            </HStack>
          </HStack>
        </VStack>
        <TxOverviewRow>
          <Text color="shy">{t('from')}</Text>
          <Text size={14}>
            {name}{' '}
            <Text size={14} as="span" color="shy">
              ({formatWalletAddress(vaultCoin.address)})
            </Text>
          </Text>
        </TxOverviewRow>
        {toAddress && (
          <TxOverviewRow>
            <Text color="shy">{t('to')}</Text>
            <Text>{toAddress}</Text>
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
            <span>{networkFeesFormatted}</span>
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
