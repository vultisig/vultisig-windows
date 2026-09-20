import { shrinkable } from '@lib/ui/css/shrinkable'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { ReactNode } from 'react'
import styled from 'styled-components'

type TxVaultSourceLabelProps = {
  name: string
  address: ReactNode
}

/**
 * A name paired with its address, as shown in a transaction row's value
 * column. The name absorbs the horizontal squeeze so the address — already
 * abbreviated, and verifiable only while intact — is never the part that gets
 * cut. Pass the address pre-truncated, or as a `MiddleTruncate` element.
 */
export const TxVaultSourceLabel = ({
  name,
  address,
}: TxVaultSourceLabelProps) => (
  <Wrapper alignItems="center" gap={4} wrap="nowrap">
    <Text weight={500} size={14} color="contrast" cropped>
      {name}
    </Text>
    <Address>{address}</Address>
  </Wrapper>
)

const Wrapper = styled(HStack)`
  ${shrinkable};
`

// Holds its intrinsic width so the squeeze lands on the name; otherwise the
// address shrinks and re-truncates down to a few unreadable characters.
const Address = styled.span`
  flex-shrink: 0;
  white-space: nowrap;
  display: flex;
  align-items: center;
`
