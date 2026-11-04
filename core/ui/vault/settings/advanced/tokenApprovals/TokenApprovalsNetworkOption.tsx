import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainDisplayName } from '@core/ui/chain/metadata/getChainDisplayName'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { HStack } from '@lib/ui/layout/Stack'
import { panel } from '@lib/ui/panel/Panel'
import { OnClickProp, ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { EvmChain } from '@vultisig/core-chain/Chain'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { isTokenApprovalsSupportedChain } from './core/tokenApprovalsChains'

/**
 * A network in the approvals network picker. Networks whose approvals can't
 * be listed say so, so picking one doesn't come as a surprise.
 */
export const TokenApprovalsNetworkOption = ({
  value: { chain },
  onClick,
}: ValueProp<{ chain: EvmChain }> & OnClickProp) => {
  const { t } = useTranslation()

  return (
    <Container
      as="button"
      type="button"
      alignItems="center"
      justifyContent="space-between"
      gap={12}
      onClick={onClick}
    >
      <HStack alignItems="center" gap={12}>
        <ChainEntityIcon
          value={getChainLogoSrc(chain)}
          style={{ fontSize: 32 }}
        />
        <Text color="contrast" size={14} weight="500">
          {getChainDisplayName(chain)}
        </Text>
      </HStack>
      {isTokenApprovalsSupportedChain(chain) ? null : (
        <Text size={12} color="shy" nowrap>
          {t('token_approvals_not_supported')}
        </Text>
      )}
    </Container>
  )
}

const Container = styled(HStack)`
  ${panel()};
  border-radius: 0;
  border: 0;
  width: 100%;
  font: inherit;
  text-align: start;
  cursor: pointer;
  padding: 12px 20px;

  &:hover {
    background: ${getColor('foregroundExtra')};
  }
`
