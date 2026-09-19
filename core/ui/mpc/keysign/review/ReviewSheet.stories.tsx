import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import {
  BlockaidRiskReview,
  BlockaidRiskReviewActions,
} from '@core/ui/chain/security/blockaid/tx/BlockaidRiskReview'
import { ReviewTruncatedValue } from '@core/ui/mpc/keysign/review/ReviewTruncatedValue'
import { Button } from '@lib/ui/buttons/Button'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { DevicesIcon } from '@lib/ui/icons/DevicesIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Chain } from '@vultisig/core-chain/Chain'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { useState } from 'react'
import styled from 'styled-components'

import { ReviewAddressCards } from './ReviewAddressCards'
import { ReviewCard } from './ReviewCard'
import { ReviewConnector } from './ReviewConnector'
import { ReviewDivider, ReviewRow } from './ReviewRow'
import { ReviewSheet } from './ReviewSheet'
import { ReviewTerms } from './ReviewTerms'
import { ReviewWarningBanner } from './ReviewWarningBanner'

const meta = {
  title: 'Keysign/ReviewSheet',
} satisfies Meta

export default meta
type Story = StoryObj

const btc = chainFeeCoin[Chain.Bitcoin]
const rune = chainFeeCoin[Chain.THORChain]

const PairedButton = styled(Button)`
  flex: 0 0 132px;
`

const SignButtons = () => (
  <HStack gap={12} fullWidth>
    <PairedButton kind="secondary" icon={<DevicesIcon />}>
      Paired
    </PairedButton>
    <Button>Fast Sign</Button>
  </HStack>
)

type FooterProps = {
  terms: string[]
  initiallyChecked?: boolean
}

const TermsFooter = ({ terms, initiallyChecked = false }: FooterProps) => {
  const [accepted, setAccepted] = useState(terms.map(() => initiallyChecked))

  return (
    <>
      <ReviewTerms
        terms={terms}
        accepted={accepted}
        onChange={(index, value) =>
          setAccepted(prev => prev.map((v, i) => (i === index ? value : v)))
        }
      />
      <SignButtons />
    </>
  )
}

const NetworkRow = ({ chain }: { chain: Chain }) => (
  <ReviewRow
    label="Network"
    value={
      <>
        <ChainEntityIcon
          value={getChainLogoSrc(chain)}
          style={{ fontSize: 16 }}
        />
        {chain}
      </>
    }
  />
)

const FeeRow = ({ label = 'Est. Network Fee' }: { label?: string }) => (
  <ReviewRow
    label={label}
    value={
      <VStack alignItems="end" gap={0}>
        <Text as="span" size={14} color="regular">
          0.04103261 RUNE
        </Text>
        <Text as="span" size={14} color="shy">
          $0.08
        </Text>
      </VStack>
    }
  />
)

const SendBody = () => (
  <>
    <VStack alignItems="center" gap={8}>
      <HStack alignItems="center" gap={4}>
        <CoinIcon coin={btc} style={{ fontSize: 24 }} />
        <Text
          as="span"
          size={22}
          weight={500}
          height={24 / 22}
          letterSpacing={-0.36}
          color="regular"
        >
          0.025 BTC
        </Text>
      </HStack>
    </VStack>
    <ReviewAddressCards
      senderName="Main Vault"
      senderAddress="0xF43jf9840fkfjn38fk0dk9Ac5"
      receiverAddress="0xF43jf9840fkfjn38fk0dk9Ac5"
    />
    <VStack gap={12}>
      <NetworkRow chain={Chain.THORChain} />
      <ReviewRow label="Memo" value="send:x/tcy:100000000" />
      <ReviewDivider />
      <FeeRow />
    </VStack>
  </>
)

const sendTerms = [
  'The amount is correct',
  "I'm sending it to the correct address",
]

export const SendOverview: Story = {
  render: () => (
    <ReviewSheet
      title="Send Overview"
      onClose={() => {}}
      footer={<TermsFooter terms={sendTerms} />}
    >
      <SendBody />
    </ReviewSheet>
  ),
}

export const SendOverviewChecked: Story = {
  render: () => (
    <ReviewSheet
      title="Send Overview"
      onClose={() => {}}
      footer={<TermsFooter terms={sendTerms} initiallyChecked />}
    >
      <SendBody />
    </ReviewSheet>
  ),
}

export const SendNotEnoughFunds: Story = {
  render: () => (
    <ReviewSheet
      title="Send Overview"
      onClose={() => {}}
      footer={
        <ReviewWarningBanner>
          {
            "Looks like your vault doesn't have enough funds for this transaction. Adjust the amount and try again."
          }
        </ReviewWarningBanner>
      }
    >
      <SendBody />
    </ReviewSheet>
  ),
}

const SwapSides = styled(HStack)`
  position: relative;
  gap: 8px;
  align-items: stretch;
`

const SwapSide = styled(ReviewCard)`
  flex: 1;
`

const SwapBody = ({ feesExpanded }: { feesExpanded: boolean }) => (
  <>
    <SwapSides>
      <SwapSide>
        <CoinIcon coin={rune} style={{ fontSize: 36 }} />
        <VStack alignItems="center">
          <Text as="span" variant="stationBodyS" color="regular">
            1,000.12 RUNE
          </Text>
          <Text as="span" variant="stationBodyS" color="shy">
            $1,203.34
          </Text>
        </VStack>
      </SwapSide>
      <ReviewConnector>
        <ChevronRightIcon />
      </ReviewConnector>
      <SwapSide>
        <CoinIcon coin={btc} style={{ fontSize: 36 }} />
        <VStack alignItems="center">
          <Text as="span" variant="stationBodyS" color="regular">
            0.01251 WBTC
          </Text>
          <Text as="span" variant="stationBodyS" color="shy">
            $1,203.34
          </Text>
        </VStack>
      </SwapSide>
    </SwapSides>
    <VStack gap={12}>
      <HStack alignItems="center" justifyContent="center" gap={8}>
        <Text as="span" variant="stationBodyS" color="regular">
          Main Vault
        </Text>
        <Text as="span" variant="stationBodyS" color="shy">
          (0xF42...9Ac5)
        </Text>
      </HStack>
      <ReviewDivider />
      <ReviewRow
        label="Provider"
        size="small"
        valueColor="shyExtra"
        value={
          <>
            <ChainEntityIcon
              value={getChainLogoSrc(Chain.THORChain)}
              style={{ fontSize: 16 }}
            />
            THORChain
          </>
        }
      />
      <ReviewRow
        label="Slippage"
        size="small"
        valueColor="shyExtra"
        value="Auto"
      />
      <HStack justifyContent="space-between" alignItems="center">
        <Text as="span" variant="footnote" color="shy">
          Total Fees
        </Text>
        <Text as="span" variant="stationBodyS" color="shyExtra">
          $6.18 {feesExpanded ? '˄' : '˅'}
        </Text>
      </HStack>
      {feesExpanded && (
        <Breakdown>
          <ReviewRow
            label="Network Fee"
            size="small"
            value="0.04103261 RUNE ($0.08)"
          />
          <ReviewRow label="Swap Fee (0.5%)" size="small" value="$0.12" />
          <ReviewRow label="Max. Total Fee" size="small" value="$6.18" />
        </Breakdown>
      )}
    </VStack>
  </>
)

const Breakdown = styled(VStack)`
  gap: 12px;
  padding-left: 12px;
  border-left: 1px solid
    ${({ theme }) => theme.colors.primaryAccentFour.toCssValue()};
`

const swapTerms = [
  'The swap amount is correct',
  "I agree with the min. amount I'll receive",
]

export const SwapOverview: Story = {
  render: () => (
    <ReviewSheet
      title="Swap Overview"
      onClose={() => {}}
      badgeTone="safe"
      footer={<TermsFooter terms={swapTerms} initiallyChecked />}
    >
      <SwapBody feesExpanded />
    </ReviewSheet>
  ),
}

export const BondOverview: Story = {
  render: () => (
    <ReviewSheet
      title="Overview"
      onClose={() => {}}
      badgeTone="safe"
      footer={<SignButtons />}
    >
      <ReviewCard>
        <Text as="span" variant="stationBodyS" color="shy">
          {"You're bonding"}
        </Text>
        <CoinIcon coin={rune} style={{ fontSize: 36 }} />
        <VStack alignItems="center" gap={4}>
          <Text
            as="span"
            size={22}
            weight={500}
            height={24 / 22}
            letterSpacing={-0.36}
            color="regular"
          >
            500 RUNE
          </Text>
          <Text as="span" size={13} color="shy">
            $1,203.34
          </Text>
        </VStack>
      </ReviewCard>
      <VStack gap={12}>
        <HStack alignItems="center" justifyContent="center" gap={8}>
          <Text as="span" variant="stationBodyS" color="regular">
            Main Vault
          </Text>
          <Text as="span" variant="stationBodyS" color="shy">
            (0xF42...9Ac5)
          </Text>
        </HStack>
        <ReviewDivider />
        <ReviewRow
          label="To"
          value={
            <ReviewTruncatedValue value="thor1h4kjq4xrxsm7ajpkstqgp9jcwxlc8khyfpwkfr" />
          }
        />
        <ReviewDivider />
        <NetworkRow chain={Chain.THORChain} />
        <ReviewDivider />
        <ReviewRow
          label="Memo"
          value={
            <ReviewTruncatedValue value="BOND:thor1h4kjq4xrxsm7ajpkstqgp9jcwxlc8khyfpwkfr" />
          }
        />
        <ReviewDivider />
        <FeeRow />
      </VStack>
    </ReviewSheet>
  ),
}

export const BlockaidMediumRisk: Story = {
  render: () => (
    <ReviewSheet
      title="Swap Overview"
      onClose={() => {}}
      badgeTone="warning"
      footer={
        <BlockaidRiskReviewActions onGoBack={() => {}} onContinue={() => {}} />
      }
    >
      <BlockaidRiskReview
        value={{
          level: 'medium',
          description:
            'This transaction involves a malicious address. Interacting with it may compromise your assets. Proceed only if you are certain.',
        }}
      />
    </ReviewSheet>
  ),
}

export const BlockaidHighRisk: Story = {
  render: () => (
    <ReviewSheet
      title="Send Overview"
      onClose={() => {}}
      badgeTone="danger"
      footer={
        <BlockaidRiskReviewActions onGoBack={() => {}} onContinue={() => {}} />
      }
    >
      <BlockaidRiskReview
        value={{
          level: 'high',
          description:
            '[TOKEN] has been flagged as malicious by Blockaid. Interacting with it may compromise your assets. Proceed only if you are certain.',
        }}
      />
    </ReviewSheet>
  ),
}
