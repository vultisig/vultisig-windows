import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { TokenVerificationBadge } from '@core/ui/chain/coin/verification/TokenVerificationBadge'
import { getTxFailureDescription } from '@core/ui/chain/tx/failure/getTxFailureDescription'
import {
  TonSimulationFailure,
  TonSimulationSwap,
} from '@core/ui/chain/tx/utils/tonEmulation'
import {
  DecodedTonMessage,
  useTonMessageDecode,
} from '@core/ui/chain/tx/utils/useTonMessageDecode'
import { useTonSimulation } from '@core/ui/chain/tx/utils/useTonSimulation'
import {
  ContainerWrapper,
  HorizontalLine,
  IconWrapper,
} from '@core/ui/vault/swap/verify/SwapVerify/SwapVerify.styled'
import { borderRadius, borderRadiusPx } from '@lib/ui/css/borderRadius'
import { toSizeUnit } from '@lib/ui/css/toSizeUnit'
import { ArrowDownIcon } from '@lib/ui/icons/ArrowDownIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { Panel } from '@lib/ui/panel/Panel'
import { WarningBlock } from '@lib/ui/status/WarningBlock'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { ThemeColor } from '@lib/ui/theme/ThemeColors'
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

import { TonMessageDetails } from './TonMessageDetails'

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
  ${borderRadius.pill};
  display: inline-flex;
  overflow: hidden;
`

const tonDecimals = chainFeeCoin[Chain.Ton].decimals
const tonTicker = chainFeeCoin[Chain.Ton].ticker

const formatTon = (amount: bigint | string): string =>
  `${formatUnits(amount, tonDecimals)} ${tonTicker}`

type FormatSwapAmountInput = {
  amount: bigint
  coin: Coin
}

const formatSwapAmount = ({ amount, coin }: FormatSwapAmountInput) =>
  formatAmount(Number(formatUnits(amount, coin.decimals)), coin)

type OperationTitleInput = {
  decoded: DecodedTonMessage
  t: TFunction
}

const operationTitle = ({ decoded, t }: OperationTitleInput): string => {
  if (decoded.swapIntent) return t('swap')
  if (decoded.intent?.kind === 'jettonTransfer') return t('jetton_transfer')
  if (decoded.intent?.kind === 'nftTransfer') return t('nft_transfer')
  if (decoded.intent?.kind === 'excesses') return t('excess_gas_refund')
  return t('transfer')
}

const TonSwapAmount = ({
  amount,
  coin,
}: {
  amount: bigint
  coin: Coin | null
}) =>
  coin ? (
    <HStack gap={8} alignItems="center">
      <RoundedCoinIconWrapper>
        <CoinIcon coin={coin} style={{ fontSize: 24 }} />
      </RoundedCoinIconWrapper>
      <Text color="contrast" size={17} weight="500">
        {formatSwapAmount({ amount, coin })}
      </Text>
      <TokenVerificationBadge value={coin} />
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
    <ContainerWrapper radius={borderRadiusPx.lg}>
      <VStack
        bgColor="foreground"
        gap={24}
        padding={24}
        radius={borderRadiusPx.lg}
      >
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

const TonSimulationFailureWarning = ({
  failure,
}: {
  failure: TonSimulationFailure
}) => {
  const { t } = useTranslation()
  const verdict = t('ton_simulation_will_fail')

  return (
    <WarningBlock>
      {failure.cause
        ? `${verdict} ${getTxFailureDescription({ failure: failure.cause, t })}`
        : verdict}
    </WarningBlock>
  )
}

const TonSimulationSwapItem = ({ swap }: { swap: TonSimulationSwap }) => {
  const { t } = useTranslation()

  return (
    <ContainerWrapper radius={borderRadiusPx.lg}>
      <VStack
        bgColor="foreground"
        gap={24}
        padding={24}
        radius={borderRadiusPx.lg}
      >
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
  const { intent, jettonCoin } = decoded

  if (intent?.kind === 'jettonTransfer') {
    const amountLabel = jettonCoin ? (
      <HStack alignItems="center" gap={6}>
        <span>
          {formatUnits(intent.amount, jettonCoin.decimals)} {jettonCoin.ticker}
        </span>
        <TokenVerificationBadge value={jettonCoin} />
      </HStack>
    ) : (
      intent.amount.toString()
    )

    return (
      <List>
        <ListItem description={intent.destination} title={t('to')} />
        <ListItem description={amountLabel} title={t('amount')} />
        <ListItem
          description={formatTon(intent.forwardTonAmount)}
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
          description={formatTon(intent.forwardAmount)}
          title={t('forward_ton_amount')}
        />
      </List>
    )
  }

  return null
}

/**
 * Keeps every outgoing message visible in signing order. Decoded intent and
 * emulation explain the request, but never replace its destinations, attached
 * amounts or per-message payload/deployment data.
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
    fromAddress,
    keysignPayload,
    signTon,
  })
  const simulationFailure = tonSimulationQuery.data?.failure
  const simulationSwap = hasSwap ? null : tonSimulationQuery.data?.swap

  return (
    <VStack gap={16}>
      {simulationFailure ? (
        <TonSimulationFailureWarning failure={simulationFailure} />
      ) : null}
      {simulationSwap ? <TonSimulationSwapItem swap={simulationSwap} /> : null}
      {decoded.map((entry, index) =>
        entry.swapIntent ? <TonSwapItem key={index} decoded={entry} /> : null
      )}
      {decoded.map((entry, index) => (
        <Panel key={index}>
          <VStack gap={12}>
            <StyledTitle color="text" fontSize={14}>
              {t('message')} {index + 1} ·{' '}
              {operationTitle({ decoded: entry, t })}
            </StyledTitle>
            <List>
              <ListItem
                description={
                  <Text size={12} style={{ overflowWrap: 'anywhere' }}>
                    {entry.message.to}
                  </Text>
                }
                title={t('destination_address')}
              />
              <ListItem
                description={formatTon(entry.message.amount)}
                title={t('amount')}
              />
            </List>
            <TonMessageItem decoded={entry} />
            <TonMessageDetails message={entry.message} />
          </VStack>
        </Panel>
      ))}
      {tonSimulationQuery.isFetching ? (
        <Text color="shy" size={12}>
          {t('blockaid_simulation_pending')}
        </Text>
      ) : tonSimulationQuery.isError ? (
        <Text color="shy" size={12}>
          {t('blockaid_simulation_failed')}
        </Text>
      ) : null}
    </VStack>
  )
}
