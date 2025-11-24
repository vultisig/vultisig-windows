import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { getBlockExplorerUrl } from '@core/chain/utils/getBlockExplorerUrl'
import { fromCommCoin } from '@core/mpc/types/utils/commCoin'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { TxOverviewAmount } from '@core/ui/mpc/keysign/tx/TxOverviewAmount'
import { ClipboardCopyIcon } from '@lib/ui/icons/ClipboardCopyIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { SquareArrowTopRightIcon } from '@lib/ui/icons/SquareArrowTopRightIcon'
import { HStack, hStack, VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { MiddleTruncate } from '@lib/ui/truncate'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useCopyToClipboard } from 'react-use'
import styled from 'styled-components'

import { useTxHash } from '../../../chain/state/txHash'
import { useCore } from '../../../state/core'
import { TransactionSuccessAnimation } from './TransactionSuccessAnimation'

export const TxSuccess = ({
  onSeeTxDetails,
  value,
}: ValueProp<KeysignPayload> & {
  onSeeTxDetails: () => void
}) => {
  const { t } = useTranslation()
  const { coin: potentialCoin, toAmount } = value
  const coin = fromCommCoin(shouldBePresent(potentialCoin))
  const txHash = useTxHash()
  const [, copyToClipboard] = useCopyToClipboard()
  const { openUrl } = useCore()

  const formattedToAmount = useMemo(() => {
    if (!toAmount) return 0

    return fromChainAmount(BigInt(toAmount), coin.decimals)
  }, [toAmount, coin.decimals])

  const blockExplorerUrl = getBlockExplorerUrl({
    chain: coin.chain,
    entity: 'tx',
    value: txHash,
  })

  return (
    <>
      <TransactionSuccessAnimation />
      <VStack gap={8}>
        {formattedToAmount > 0 && (
          <TxOverviewAmount amount={formattedToAmount} value={coin} />
        )}
        <List>
          <ListItem
            hoverable
            extra={
              <HStack
                flexGrow
                alignItems="center"
                gap={8}
                justifyContent="flex-end"
              >
                <TruncatedTextWrapper>
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
            title={
              <Text size={14} color="shy">
                {t('tx_hash')}
              </Text>
            }
          />
          <ListItem
            onClick={onSeeTxDetails}
            title={<Text size={14}>{t('transaction_details')}</Text>}
            hoverable
            showArrow
          />
        </List>
      </VStack>
    </>
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
