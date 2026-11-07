import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainDisplayName } from '@core/ui/chain/metadata/getChainDisplayName'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack } from '@lib/ui/layout/Stack'
import { OnClickProp, ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { TokenApprovalsChain } from './core/tokenApprovalsChains'

/**
 * Field above the approvals list naming the chain it shows, or all chains
 * when none is picked. Opens the chain picker.
 */
export const TokenApprovalsChainField = ({
  value,
  onClick,
}: ValueProp<TokenApprovalsChain | null> & OnClickProp) => {
  const { t } = useTranslation()

  return (
    <Container data-testid="token-approvals-chain-field" onClick={onClick}>
      <HStack alignItems="center" gap={6}>
        {value ? <ChainIcon value={getChainLogoSrc(value)} /> : null}
        <Text size={16} weight={500} color="regular">
          {value ? getChainDisplayName(value) : t('token_approvals_all_chains')}
        </Text>
      </HStack>
      <IconWrapper size={20}>
        <ChevronRightIcon />
      </IconWrapper>
    </Container>
  )
}

const Container = styled(UnstyledButton)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  height: 56px;
  /* 16px from the outer edge, as in the design, with the 1px border inside it. */
  padding: 0 15px;
  ${borderRadius.md};
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  color: ${getColor('text')};
`

const ChainIcon = styled(ChainEntityIcon)`
  font-size: 32px;
  ${borderRadius.pill};
  box-shadow: 0 0 0 1px ${getColor('foregroundExtra')};
`
