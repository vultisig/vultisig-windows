import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import {
  DecodedTonMessage,
  useTonMessageDecode,
} from '@core/ui/chain/tx/utils/useTonMessageDecode'
import {
  TonSimulationInfo,
  useTonSimulation,
} from '@core/ui/chain/tx/utils/useTonSimulation'
import {
  ContainerWrapper,
  HorizontalLine,
  IconWrapper,
} from '@core/ui/vault/swap/verify/SwapVerify/SwapVerify.styled'
import { toSizeUnit } from '@lib/ui/css/toSizeUnit'
import { ArrowDownIcon } from '@lib/ui/icons/ArrowDownIcon'
import { Collapse } from '@lib/ui/layout/Collapse'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { Panel } from '@lib/ui/panel/Panel'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { ThemeColor } from '@lib/ui/theme/ThemeColors'
import { Address } from '@ton/core'
import { Chain } from '@vultisig/core-chain/Chain'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { SignTon } from '@vultisig/core-mpc/types/vultisig/keysign/v1/wasm_execute_contract_payload_pb'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { formatUnits } from 'ethers'
import { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import styled, { CSSProperties } from 'styled-components'

type Styles = {
  color: ThemeColor
  fontSize: NonNullable<CSSProperties['fontSize']>
}

const StyledTitle = styled.span<Styles>`
  color: ${({ color }) => getColor(color)};
  font-size: ${({ fontSize }) => toSizeUnit(fontSize)};
  font-weight: 500;
  line-height: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const RoundedCoinIconWrapper = styled.div`
  border-radius: 99px;
  display: inline-flex;
  overflow: hidden;
`

const tonDecimals = chainFeeCoin[Chain.Ton].decimals
const tonTicker = chainFeeCoin[Chain.Ton].ticker

const formatTon = (amount: bigint | string): string =>
  `${formatUnits(amount, tonDecimals)} ${tonTicker}`

const formatSwapAmount = (amount: bigint, coin: Coin) =>
  formatAmount(Number(formatUnits(amount, coin.decimals)), coin)

const normalizeTonAddress = (address?: string) => {
  if (!address) return null

  try {
    return Address.parse(address).toString()
  } catch {
    return address
  }
}

const operationTitle = (decoded: DecodedTonMessage, t: TFunction): string => {
  if (decoded.swapIntent) return t('swap')
  if (decoded.intent?.kind === 'jettonTransfer') return t('jetton_transfer')
  if (decoded.intent?.kind === 'nftTransfer') return t('nft_transfer')
  if (decoded.intent?.kind === 'excesses') return t('excess_gas_refund')
  return t('transfer')
}

const RawPayloadDetails = ({ payload }: { payload?: string }) => {
  const { t } = useTranslation()

  if (!payload) return null

  return (
    <Collapse title={t('transaction_details')}>
      <VStack gap={4}>
        <Text color="shy" size={12}>
          {t('raw_payload')}
        </Text>
        <Text
          color="primary"
          family="mono"
          size={12}
          style={{ wordBreak: 'break-all' }}
        >
          {payload}
        </Text>
      </VStack>
    </Collapse>
  )
}

const RawPayloadDetailsPanel = ({ payload }: { payload?: string }) => {
  if (!payload) return null

  return (
    <Panel>
      <RawPayloadDetails payload={payload} />
    </Panel>
  )
}

const TonSwapAmount = ({
  amount,
  coin,
}: {
  amount: bigint
  coin: Coin | null
}) =>
  coin ? (
    <HStack gap={8}>
      <RoundedCoinIconWrapper>
        <CoinIcon coin={coin} style={{ fontSize: 24 }} />
      </RoundedCoinIconWrapper>
      <Text color="contrast" size={17} weight="500">
        {formatSwapAmount(amount, coin)}
      </Text>
    </HStack>
  ) : (
    <Text color="contrast" size={17} weight="500">
      {amount.toString()}
    </Text>
  )

const TonSwapItem = ({ decoded }: { decoded: DecodedTonMessage }) => {
  const { t } = useTranslation()
  const { jettonCoin, swapIntent, swapOutputCoin } = decoded
  if (!swapIntent) return null

  const fromCoin =
    swapIntent.offerAsset === 'ton' ? chainFeeCoin[Chain.Ton] : jettonCoin

  return (
    <ContainerWrapper radius={16}>
      <VStack bgColor="foreground" gap={24} padding={24} radius={16}>
        <Text color="supporting" size={15}>
          {t('youre_swapping')}
        </Text>
        <VStack gap={18}>
          <TonSwapAmount amount={swapIntent.offerAmount} coin={fromCoin} />
          <HStack alignItems="center" gap={10}>
            <IconWrapper>
              <ArrowDownIcon />
            </IconWrapper>
            {t('to')}
            <HorizontalLine />
          </HStack>
          {swapIntent.minOut ? (
            <TonSwapAmount amount={swapIntent.minOut} coin={swapOutputCoin} />
          ) : null}
        </VStack>
      </VStack>
    </ContainerWrapper>
  )
}

const TonSimulationSwapItem = ({
  swap,
}: {
  swap: NonNullable<TonSimulationInfo>['swap']
}) => {
  const { t } = useTranslation()

  return (
    <ContainerWrapper radius={16}>
      <VStack bgColor="foreground" gap={24} padding={24} radius={16}>
        <Text color="supporting" size={15}>
          {t('youre_swapping')}
        </Text>
        <VStack gap={18}>
          <TonSwapAmount amount={swap.fromAmount} coin={swap.fromCoin} />
          <HStack alignItems="center" gap={10}>
            <IconWrapper>
              <ArrowDownIcon />
            </IconWrapper>
            {t('to')}
            <HorizontalLine />
          </HStack>
          <TonSwapAmount amount={swap.toAmount} coin={swap.toCoin} />
        </VStack>
      </VStack>
    </ContainerWrapper>
  )
}

const TonMessageItem = ({ decoded }: { decoded: DecodedTonMessage }) => {
  const { t } = useTranslation()
  const { message, intent, jettonCoin } = decoded

  if (intent?.kind === 'jettonTransfer') {
    const amountLabel = jettonCoin
      ? `${formatUnits(intent.amount, jettonCoin.decimals)} ${jettonCoin.ticker}`
      : intent.amount.toString()

    return (
      <List>
        <ListItem description={intent.destination} title={t('to')} />
        <ListItem description={amountLabel} title={t('amount')} />
        <ListItem
          description={formatTon(message.amount)}
          title={t('forward_ton_amount')}
        />
      </List>
    )
  }

  if (intent?.kind === 'nftTransfer') {
    return (
      <List>
        <ListItem description={intent.newOwner} title={t('to')} />
        <ListItem
          description={formatTon(message.amount)}
          title={t('forward_ton_amount')}
        />
      </List>
    )
  }

  return (
    <List>
      <ListItem description={message.to} title={t('to')} />
      <ListItem description={formatTon(message.amount)} title={t('amount')} />
    </List>
  )
}

const isSwapSidecarTransfer = (
  entry: DecodedTonMessage,
  fromAddress?: string
) => {
  if (entry.swapIntent) return false

  const from = normalizeTonAddress(fromAddress)
  const to = normalizeTonAddress(entry.message.to)

  if (from && to !== from) return false

  try {
    return BigInt(entry.message.amount) <= 10_000_000n
  } catch {
    return false
  }
}

/**
 * Renders the keysign verify/done view for a TON transaction. Decodes each
 * outgoing TON message body, resolves jetton metadata, and either displays a
 * TonAPI-simulated swap card or per-message details (jetton transfer, NFT
 * transfer, gas refund, or generic). The raw BOC payload is always available
 * under a collapsible details section.
 */
export const SignTonDisplay = ({
  signTon,
  fromAddress,
  keysignPayload,
}: {
  signTon: SignTon
  fromAddress?: string
  keysignPayload: KeysignPayload
}) => {
  const { t } = useTranslation()
  const { decoded } = useTonMessageDecode({ tonMessages: signTon.tonMessages })
  const hasSwap = decoded.some(entry => entry.swapIntent)
  const tonSimulationQuery = useTonSimulation({
    enabled: !hasSwap,
    fromAddress,
    keysignPayload,
    signTon,
  })
  const simulationSwap = hasSwap ? null : tonSimulationQuery.data?.swap
  const isSimulationResolving = !hasSwap && tonSimulationQuery.isFetching
  const visibleEntries =
    simulationSwap || isSimulationResolving
      ? []
      : hasSwap
        ? decoded.filter(
            entry =>
              entry.swapIntent || !isSwapSidecarTransfer(entry, fromAddress)
          )
        : decoded

  return (
    <VStack gap={16}>
      {simulationSwap ? (
        <VStack gap={12}>
          <TonSimulationSwapItem swap={simulationSwap} />
          <RawPayloadDetailsPanel payload={signTon.tonMessages[0]?.payload} />
        </VStack>
      ) : null}
      {visibleEntries.map((entry, index) =>
        entry.swapIntent ? (
          <VStack gap={12} key={index}>
            <TonSwapItem decoded={entry} />
            <RawPayloadDetailsPanel payload={entry.message.payload} />
          </VStack>
        ) : (
          <Panel key={index}>
            <VStack gap={12}>
              <StyledTitle color="text" fontSize={14}>
                {operationTitle(entry, t)}
              </StyledTitle>
              <TonMessageItem decoded={entry} />
              <RawPayloadDetails payload={entry.message.payload} />
            </VStack>
          </Panel>
        )
      )}
    </VStack>
  )
}
