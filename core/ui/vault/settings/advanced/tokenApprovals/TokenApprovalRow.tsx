import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { getChainDisplayName } from '@core/ui/chain/metadata/getChainDisplayName'
import { formatTokenAmount } from '@core/ui/chain/tx/utils/formatTokenAmount'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { LinkTwoOffIcon } from '@lib/ui/icons/LinkTwoOffIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { OnClickProp, ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { getSpenderLabel } from './core/getSpenderLabel'
import { isUnlimitedAllowance } from './core/isUnlimitedAllowance'
import { shortenAddress } from './core/shortenAddress'
import { TokenApproval } from './core/TokenApproval'
import { EvmAddressText } from './EvmAddressText'

type TokenApprovalRowProps = ValueProp<TokenApproval> & {
  onRevoke: OnClickProp['onClick']
}

/**
 * One approval in the list: the token and its chain, who may spend it and
 * how much, and the revoke button.
 */
export const TokenApprovalRow = ({
  value,
  onRevoke,
}: TokenApprovalRowProps) => {
  const { t } = useTranslation()
  const { token, spender, allowance, kind } = value
  const spenderName = getSpenderLabel(value) ?? shortenAddress(spender)
  const amount = isUnlimitedAllowance(value)
    ? t('unlimited')
    : `${formatTokenAmount({ rawAmount: allowance, decimals: token.decimals }).display} ${token.ticker}`

  return (
    <HStack alignItems="center" gap={8}>
      <Asset alignItems="center" gap={8}>
        <CoinIcon coin={token} style={{ fontSize: 30 }} />
        <VStack style={{ minWidth: 0 }}>
          <Text size={12} weight="500" color="regular" cropped>
            {token.ticker}
          </Text>
          <Text size={10} weight="500" color="shy" cropped>
            {getChainDisplayName(token.chain)}
          </Text>
        </VStack>
      </Asset>
      <VStack alignItems="end" gap={2} style={{ flex: 1, minWidth: 0 }}>
        <EvmAddressText size={14} weight="500" color="shy" cropped>
          {kind === 'permit2' ? `${spenderName} · Permit2` : spenderName}
        </EvmAddressText>
        <Text
          size={14}
          weight="500"
          color="regular"
          cropped
          title={amount}
          style={{ maxWidth: '100%' }}
        >
          {amount}
        </Text>
      </VStack>
      <RevokeButton
        aria-label={t('revoke')}
        title={t('revoke')}
        onClick={onRevoke}
      >
        <LinkTwoOffIcon />
      </RevokeButton>
    </HStack>
  )
}

// The spender label shrinks first; the asset keeps its width up to half the row.
const Asset = styled(HStack)`
  flex-shrink: 0;
  max-width: 50%;
  padding: 6px 12px 6px 6px;
`

const RevokeButton = styled(IconButton)`
  color: ${getColor('textShy')};
  font-size: 24px;

  &:hover {
    color: ${getColor('danger')};
  }
`
