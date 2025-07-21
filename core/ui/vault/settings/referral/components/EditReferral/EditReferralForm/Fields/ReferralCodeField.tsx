import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { CopyIcon } from '@lib/ui/icons/CopyIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useCopyToClipboard } from 'react-use'
import styled from 'styled-components'

import { useCurrentVaultCoin } from '../../../../../../state/currentVaultCoins'
import { useUserValidThorchainNameQuery } from '../../../../queries/useUserValidThorchainNameQuery'

export const ReferralCodeField = () => {
  const { address } = useCurrentVaultCoin({
    chain: chainFeeCoin.THORChain.chain,
    id: 'RUNE',
  })

  const { data: nameDetails } = useUserValidThorchainNameQuery(address)
  const name = shouldBePresent(nameDetails?.name)
  const [, copyToClipboard] = useCopyToClipboard()

  return (
    <FieldWrapper
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Text>{name}</Text>
      <FieldIconWrapper>
        <UnstyledButton onClick={() => copyToClipboard(name)}>
          <CopyIcon />
        </UnstyledButton>
      </FieldIconWrapper>
    </FieldWrapper>
  )
}

const FieldWrapper = styled(VStack)`
  border-radius: 12px;
  border: 1px solid ${getColor('foregroundExtra')};
  background: ${getColor('foreground')};
  padding: 14px;
`
const FieldIconWrapper = styled(IconWrapper)`
  font-size: 20px;
`
