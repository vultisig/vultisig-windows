import styled from 'styled-components'

import {
  textInputBackground,
  textInputFrame,
} from '../../../../lib/ui/css/textInput'
import { hStack } from '../../../../lib/ui/layout/Stack'
import { text } from '../../../../lib/ui/text'

export const FeeContainer = styled.div`
  ${textInputFrame};
  ${textInputBackground};

  ${text({
    color: 'supporting',
    weight: 600,
    size: 16,
  })}
  ${hStack({
    alignItems: 'center',
    justifyContent: 'space-between',
  })}
`
