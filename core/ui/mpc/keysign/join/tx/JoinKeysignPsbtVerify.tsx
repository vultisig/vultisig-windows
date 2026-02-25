import { fromCommCoin } from '@core/mpc/types/utils/commCoin'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { BlockaidSimulationError } from '@core/ui/chain/security/blockaid/tx/BlockaidSimulationError'
import { KeysignFeeAmount } from '@core/ui/mpc/keysign/tx/FeeAmount'
import { ContainerWrapper } from '@core/ui/vault/swap/verify/SwapVerify/SwapVerify.styled'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { formatAmount } from '@lib/utils/formatAmount'
import { assertField } from '@lib/utils/record/assertField'
import { formatUnits } from 'ethers'
import { useTranslation } from 'react-i18next'

import { JoinKeysignTxPrimaryInfo } from './JoinKeysignTxPrimaryInfo'
import { useJoinKeysignPsbtTransferInfoQuery } from './useJoinKeysignPsbtTransferInfoQuery'

export const JoinKeysignPsbtVerify = ({ value }: ValueProp<KeysignPayload>) => {
  const { t } = useTranslation()
  const coin = fromCommCoin(assertField(value, 'coin'))
  const psbtTransferInfoQuery = useJoinKeysignPsbtTransferInfoQuery({
    keysignPayload: value,
  })

  return (
    <MatchQuery
      value={psbtTransferInfoQuery}
      success={transferInfo =>
        transferInfo && 'transfer' in transferInfo ? (
          <>
            <ContainerWrapper radius={16}>
              <VStack bgColor="foreground" gap={24} padding={24} radius={16}>
                <Text color="supporting" size={15}>
                  {t('you_are_sending')}
                </Text>
                <VStack gap={16}>
                  <HStack gap={8} alignItems="center">
                    <CoinIcon
                      coin={transferInfo.transfer.fromCoin}
                      style={{ fontSize: 24 }}
                    />
                    <VStack gap={4}>
                      <Text weight="500" size={17} color="contrast">
                        {formatAmount(
                          Number(
                            formatUnits(
                              transferInfo.transfer.fromAmount,
                              transferInfo.transfer.fromCoin.decimals
                            )
                          ),
                          transferInfo.transfer.fromCoin
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
        ) : (
          <JoinKeysignTxPrimaryInfo value={value} />
        )
      }
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
