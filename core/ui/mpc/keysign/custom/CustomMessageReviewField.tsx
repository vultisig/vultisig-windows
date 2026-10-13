import { borderRadius } from '@lib/ui/css/borderRadius'
import { vStack } from '@lib/ui/layout/Stack'
import { ChildrenProp, TitleProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

const Container = styled.div`
  ${vStack({
    gap: 12,
  })};

  padding: 16px 20px;
  ${borderRadius.md};
  border: 1px solid ${getColor('foregroundExtra')};
  background: rgba(11, 26, 58, 0.5);
  min-width: 0;
`

const Value = styled(Text)`
  white-space: pre-wrap;
  word-break: break-word;
`

/** One labelled card on a custom-message verify screen. */
export const CustomMessageReviewField = ({
  title,
  children,
}: TitleProp & ChildrenProp) => (
  <Container>
    <Text size={12} color="shy" weight={500}>
      {title}
    </Text>
    <Value size={14} weight={500}>
      {children}
    </Value>
  </Container>
)
