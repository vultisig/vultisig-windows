import { OnClickProp, ValueProp } from '@lib/ui/props'
import { toPercents } from '@lib/utils/toPercents'
import styled from 'styled-components'

import { UnstyledButton } from '../../../lib/ui/buttons/UnstyledButton'
import { borderRadius } from '../../../lib/ui/css/borderRadius'
import { centerContent } from '../../../lib/ui/css/centerContent'
import { text } from '../../../lib/ui/text'
import { getHoverVariant } from '../../../lib/ui/theme/getHoverVariant'
import { getColor } from '../../../lib/ui/theme/getters'

const Container = styled(UnstyledButton)`
  width: 56px;
  height: 30px;
  ${borderRadius.s};
  background: ${getColor('foreground')};

  ${text({
    size: 12,
    weight: '600',
    color: 'contrast',
  })}

  ${centerContent};

  &:hover {
    background: ${getHoverVariant('foreground')};
  }
`

export const AmountSuggestion: React.FC<ValueProp<number> & OnClickProp> = ({
  value,
  onClick,
}) => {
  return <Container onClick={onClick}>{toPercents(value)}</Container>
}
