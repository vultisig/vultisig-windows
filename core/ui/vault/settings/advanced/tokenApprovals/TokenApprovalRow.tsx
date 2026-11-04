import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { Button } from '@lib/ui/buttons/Button'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { OnClickProp, ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { AllowanceBadge } from './AllowanceBadge'
import { shortenEvmAddress } from './core/shortenEvmAddress'
import { TokenApproval } from './core/TokenApproval'
import { EvmAddressText } from './EvmAddressText'

type TokenApprovalRowProps = ValueProp<TokenApproval> & {
  onRevoke: OnClickProp['onClick']
}

/**
 * One allowance in the approvals list: the token, the spender contract's
 * address, the current allowance and a Revoke button.
 */
export const TokenApprovalRow = ({
  value: { token, spender, allowance },
  onRevoke,
}: TokenApprovalRowProps) => {
  const { t } = useTranslation()

  return (
    <Container alignItems="center" gap={12}>
      <CoinIcon coin={token} style={{ fontSize: 32 }} />
      <Info gap={3}>
        <Text size={15} weight="500" color="contrast" cropped>
          {token.ticker}
        </Text>
        <HStack alignItems="center" gap={5}>
          <Text size={12} color="shy">
            {t('spender')}
          </Text>
          <EvmAddressText size={13} weight="500" color="supporting" nowrap>
            {shortenEvmAddress(spender)}
          </EvmAddressText>
        </HStack>
      </Info>
      <VStack alignItems="end" gap={8}>
        <AllowanceBadge
          amount={allowance}
          decimals={token.decimals}
          ticker={token.ticker}
        />
        <Button kind="secondary" size="xs" onClick={onRevoke}>
          {t('revoke')}
        </Button>
      </VStack>
    </Container>
  )
}

const Container = styled(HStack)`
  padding: 14px 12px;
  background: ${getColor('foreground')};

  & + & {
    border-top: 1px solid ${getColor('foregroundExtra')};
  }
`

const Info = styled(VStack)`
  flex: 1;
  min-width: 0;
`
