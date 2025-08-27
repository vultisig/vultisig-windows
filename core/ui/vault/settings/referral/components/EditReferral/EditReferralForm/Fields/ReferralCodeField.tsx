import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { CopyIcon } from '@lib/ui/icons/CopyIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useCopyToClipboard } from 'react-use'
import styled from 'styled-components'

import { useUserValidThorchainNameQuery } from '../../../../queries/useUserValidThorchainNameQuery'

export const ReferralCodeField = () => {
  const { data: nameDetails } = useUserValidThorchainNameQuery()
  const [, copyToClipboard] = useCopyToClipboard()

  return (
    <FieldWrapper
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Text>{nameDetails?.name}</Text>
      <FieldIconWrapper>
        <UnstyledButton
          onClick={() => copyToClipboard(nameDetails?.name || '')}
        >
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
