import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { getKeysignSwapPayload } from '@core/mpc/keysign/swap/getKeysignSwapPayload'
import { getKeysignSwapProviderName } from '@core/mpc/keysign/swap/getKeysignSwapProviderName'
import { fromCommCoin } from '@core/mpc/types/utils/commCoin'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
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
import { Text } from '@lib/ui/text'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { formatAmount } from '@lib/utils/formatAmount'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { useTranslation } from 'react-i18next'

import { JoinSwapFiatAmount } from './JoinSwapFiatAmount'

export const JoinKeysignSwapVerify = ({ value }: ValueProp<KeysignPayload>) => {
  const { t } = useTranslation()

  const swapPayload = shouldBePresent(
    getKeysignSwapPayload(value),
    'swap payload'
  )

  const {
    fromCoin: protobufFromCoin,
    toCoin: protobufToCoin,
    fromAmount,
    toAmountDecimal,
  } = getRecordUnionValue(swapPayload)

  const fromCoin = fromCommCoin(shouldBePresent(protobufFromCoin, 'fromCoin'))
  const toCoin = protobufToCoin ? fromCommCoin(protobufToCoin) : null

  const fromAmountDecimal = fromChainAmount(
    BigInt(fromAmount),
    fromCoin.decimals
  )
  const toAmount = Number(toAmountDecimal)

  const provider = getKeysignSwapProviderName(swapPayload)

  return (
    <>
      <ContainerWrapper radius={16}>
        <VStack bgColor="foreground" gap={24} padding={24} radius={16}>
          <Text color="supporting" size={15}>
            {t('youre_swapping')}
          </Text>
          <VStack gap={16}>
            <HStack gap={8}>
              <CoinIcon coin={fromCoin} style={{ fontSize: 24 }} />
              <VStack>
                <Text weight="500" size={17} color="contrast">
                  {formatAmount(fromAmountDecimal, fromCoin)}
                </Text>
                <JoinSwapFiatAmount
                  coin={fromCoin}
                  amount={fromAmountDecimal}
                />
              </VStack>
            </HStack>
            <HStack alignItems="center" gap={10}>
              <IconWrapper>
                <ArrowDownIcon />
              </IconWrapper>
              {t('to')}
              <HorizontalLine />
            </HStack>
            {toCoin && (
              <HStack gap={8}>
                <CoinIcon coin={toCoin} style={{ fontSize: 24 }} />
                <VStack>
                  <Text weight="500" size={17} color="contrast">
                    {formatAmount(toAmount, toCoin)}
                  </Text>
                  <JoinSwapFiatAmount coin={toCoin} amount={toAmount} />
                </VStack>
              </HStack>
            )}
          </VStack>
        </VStack>
      </ContainerWrapper>
      <VStack bgColor="foreground" gap={12} padding={12} radius={16}>
        <List>
          <ListItem
            hoverable={false}
            title={t('provider')}
            extra={<Text color="shy">{provider}</Text>}
          />
          <ListItem
            hoverable={false}
            title={t('network_fee')}
            extra={<KeysignFeeAmount keysignPayload={value} />}
          />
        </List>
      </VStack>
    </>
  )
}
