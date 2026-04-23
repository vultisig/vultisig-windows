import { useCore } from '@core/ui/state/core'
import { Button } from '@lib/ui/buttons/Button'
import { CircleCheckIcon } from '@lib/ui/icons/CircleCheckIcon'
import { ClipboardCopyIcon } from '@lib/ui/icons/ClipboardCopyIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { SquareArrowTopRightIcon } from '@lib/ui/icons/SquareArrowTopRightIcon'
import { HStack, hStack, VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { MiddleTruncate } from '@lib/ui/truncate'
import { Chain } from '@vultisig/core-chain/Chain'
import { getBlockExplorerUrl } from '@vultisig/core-chain/utils/getBlockExplorerUrl'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { useTranslation } from 'react-i18next'
import { useCopyToClipboard } from 'react-use'
import styled from 'styled-components'

const btcDecimals = 8

type ClaimResultProps = {
  totalAmountClaimed: bigint
  utxosClaimed: number
  utxosSkipped: number
  txHash: string
  onDone: () => void
}

/** Success screen summarising a completed QBTC claim. */
export const ClaimResult = ({
  totalAmountClaimed,
  utxosClaimed,
  utxosSkipped,
  txHash,
  onDone,
}: ClaimResultProps) => {
  const { t } = useTranslation()
  const [, copyToClipboard] = useCopyToClipboard()
  const { openUrl } = useCore()

  const totalBtc = Number(totalAmountClaimed) / 10 ** btcDecimals
  const blockExplorerUrl = getBlockExplorerUrl({
    chain: Chain.QBTC,
    entity: 'tx',
    value: txHash,
  })

  return (
    <VStack
      gap={36}
      style={{ paddingTop: 24 }}
      data-testid="qbtc-claim-success"
    >
      <VStack alignItems="center" gap={12}>
        <Text color="primary" style={{ fontSize: 48 }}>
          <CircleCheckIcon />
        </Text>
        <Text color="contrast" size={18} weight="600">
          {t('qbtc_claim_success_title')}
        </Text>
        <Text color="primary" size={24} weight="700">
          {formatAmount(totalBtc, { precision: 'high' })} QBTC
        </Text>
      </VStack>

      <List>
        <ListItem
          title={
            <Text size={14} color="shy">
              {t('qbtc_claim_utxos_claimed')}
            </Text>
          }
          extra={<Text size={14}>{utxosClaimed}</Text>}
        />
        <ListItem
          title={
            <Text size={14} color="shy">
              {t('qbtc_claim_utxos_skipped')}
            </Text>
          }
          extra={<Text size={14}>{utxosSkipped}</Text>}
        />
        <ListItem
          hoverable
          title={
            <Text size={14} color="shy">
              {t('tx_hash')}
            </Text>
          }
          extra={
            <HStack
              flexGrow
              alignItems="center"
              gap={8}
              justifyContent="flex-end"
            >
              <TruncatedTextWrapper data-hash={txHash}>
                <Text size={14}>
                  <MiddleTruncate width={85} text={txHash} />
                </Text>
              </TruncatedTextWrapper>
              <TxRowIconButton
                onClick={() => copyToClipboard(blockExplorerUrl)}
              >
                <ClipboardCopyIcon />
              </TxRowIconButton>
              <TxRowIconButton onClick={() => openUrl(blockExplorerUrl)}>
                <SquareArrowTopRightIcon />
              </TxRowIconButton>
            </HStack>
          }
        />
      </List>

      <Button kind="primary" onClick={onDone}>
        {t('qbtc_claim_done')}
      </Button>
    </VStack>
  )
}

const TxRowIconButton = styled(IconWrapper).attrs({
  role: 'button',
  tabIndex: 0,
})`
  cursor: pointer;
  font-size: 16px;
  outline: none;

  &:hover {
    color: ${getColor('textShy')};
  }

  &:focus-visible {
    color: ${getColor('textShy')};
  }
`

const TruncatedTextWrapper = styled.div`
  ${hStack({
    justifyContent: 'flex-end',
  })};
`
