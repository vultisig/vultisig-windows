import { BlockaidEvmSimulationInfo } from '@core/chain/security/blockaid/tx/simulation/core'
import { fromCommCoin } from '@core/mpc/types/utils/commCoin'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { BlockaidSimulationError } from '@core/ui/chain/security/blockaid/tx/BlockaidSimulationError'
import { useJoinKeysignBlockaidSimulationQuery } from '@core/ui/chain/security/blockaid/tx/queries/useJoinKeysignBlockaidSimulationQuery'
import { KeysignFeeAmount } from '@core/ui/mpc/keysign/tx/FeeAmount'
import {
  ContainerWrapper,
  HorizontalLine,
  IconWrapper,
} from '@core/ui/vault/swap/verify/SwapVerify/SwapVerify.styled'
import { ArrowDownIcon } from '@lib/ui/icons/ArrowDownIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { formatAmount } from '@lib/utils/formatAmount'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { assertField } from '@lib/utils/record/assertField'
import { formatUnits } from 'ethers'
import { useTranslation } from 'react-i18next'

import { JoinKeysignTxPrimaryInfo } from './JoinKeysignTxPrimaryInfo'

/**
 * Uses Blockaid simulation API for EVM and Solana keysign payloads.
 * Shows "You are sending" or "You're swapping" based on simulation result.
 */
export const JoinKeysignBlockaidVerify = ({
  value,
}: ValueProp<KeysignPayload>) => {
  const { t } = useTranslation()
  const walletCore = useAssertWalletCore()
  const coin = fromCommCoin(assertField(value, 'coin'))
  const blockaidSimulationQuery = useJoinKeysignBlockaidSimulationQuery({
    keysignPayload: value,
    walletCore,
  })

  return (
    <MatchQuery
      value={blockaidSimulationQuery}
      success={(simulationInfo: BlockaidEvmSimulationInfo | null) => {
        if (simulationInfo === null) {
          return <JoinKeysignTxPrimaryInfo value={value} />
        }
        return matchRecordUnion(simulationInfo, {
          transfer: transfer => (
            <>
              <ContainerWrapper radius={16}>
                <VStack bgColor="foreground" gap={24} padding={24} radius={16}>
                  <Text color="supporting" size={15}>
                    {t('you_are_sending')}
                  </Text>
                  <VStack gap={16}>
                    <HStack gap={8} alignItems="center">
                      <CoinIcon
                        coin={transfer.fromCoin}
                        style={{ fontSize: 24 }}
                      />
                      <VStack gap={4}>
                        <Text weight="500" size={17} color="contrast">
                          {formatAmount(
                            Number(
                              formatUnits(
                                transfer.fromAmount,
                                transfer.fromCoin.decimals
                              )
                            ),
                            transfer.fromCoin
                          )}{' '}
                        </Text>
                      </VStack>
                    </HStack>
                  </VStack>
                </VStack>
              </ContainerWrapper>
              <VStack bgColor="foreground" gap={12} padding={12} radius={16}>
                <List>
                  <ListItem
                    hoverable={false}
                    title={t('from')}
                    extra={<Text color="shy">{coin.address}</Text>}
                  />
                  {value.toAddress && (
                    <ListItem
                      hoverable={false}
                      title={t('to')}
                      extra={<Text color="shy">{value.toAddress}</Text>}
                    />
                  )}
                  {value.memo && (
                    <ListItem
                      hoverable={false}
                      title={t('memo')}
                      extra={<Text color="shy">{value.memo}</Text>}
                    />
                  )}
                  <ListItem
                    hoverable={false}
                    title={t('network_fee')}
                    extra={<KeysignFeeAmount keysignPayload={value} />}
                  />
                </List>
              </VStack>
            </>
          ),
          swap: swap => (
            <>
              <ContainerWrapper radius={16}>
                <VStack bgColor="foreground" gap={24} padding={24} radius={16}>
                  <Text color="supporting" size={15}>
                    {t('youre_swapping')}
                  </Text>
                  <VStack gap={16}>
                    <HStack gap={8}>
                      <CoinIcon coin={swap.fromCoin} style={{ fontSize: 24 }} />
                      <Text weight="500" size={17} color="contrast">
                        {formatAmount(
                          Number(
                            formatUnits(swap.fromAmount, swap.fromCoin.decimals)
                          ),
                          swap.fromCoin
                        )}{' '}
                      </Text>
                    </HStack>
                    <HStack alignItems="center" gap={10}>
                      <IconWrapper>
                        <ArrowDownIcon />
                      </IconWrapper>
                      {t('to')}
                      <HorizontalLine />
                    </HStack>
                    <HStack gap={8}>
                      <CoinIcon coin={swap.toCoin} style={{ fontSize: 24 }} />
                      <Text weight="500" size={17} color="contrast">
                        {formatAmount(
                          Number(
                            formatUnits(swap.toAmount, swap.toCoin.decimals)
                          ),
                          swap.toCoin
                        )}{' '}
                      </Text>
                    </HStack>
                  </VStack>
                </VStack>
              </ContainerWrapper>
              <VStack bgColor="foreground" gap={12} padding={12} radius={16}>
                <List>
                  {value.memo && (
                    <ListItem
                      hoverable={false}
                      title={t('memo')}
                      extra={<Text color="shy">{value.memo}</Text>}
                    />
                  )}
                  <ListItem
                    hoverable={false}
                    title={t('network_fee')}
                    extra={<KeysignFeeAmount keysignPayload={value} />}
                  />
                </List>
              </VStack>
            </>
          ),
        })
      }}
      error={() => (
        <>
          <BlockaidSimulationError />
          <JoinKeysignTxPrimaryInfo value={value} />
        </>
      )}
      pending={() => <JoinKeysignTxPrimaryInfo value={value} />}
      inactive={() => <JoinKeysignTxPrimaryInfo value={value} />}
    />
  )
}
