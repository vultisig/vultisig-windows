import { verticalPadding } from '@lib/ui/css/verticalPadding'
import { VStack } from '@lib/ui/layout/Stack'
import { updateAtIndex } from '@lib/utils/array/updateAtIndex'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { Checkbox } from '../../../lib/ui/inputs/checkbox/Checkbox'
import { swapTerms, useSwapTerms } from './state/swapTerms'

const Item = styled(Checkbox)`
  ${verticalPadding(10)}

  font-family: inherit;
  font-size: 14px;
`

export const SwapTerms = () => {
  const { t } = useTranslation()

  const [value, setValue] = useSwapTerms()

  return (
    <VStack>
      {swapTerms.map((term, index) => {
        const text = t(`swap_terms.${term}`)

        return (
          <Item
            key={term}
            label={text}
            value={value[index]}
            onChange={v =>
              setValue(prev => updateAtIndex(prev, index, () => v))
            }
          />
        )
      })}
    </VStack>
  )
}
