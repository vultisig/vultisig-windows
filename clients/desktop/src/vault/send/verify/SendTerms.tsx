import { verticalPadding } from '@lib/ui/css/verticalPadding'
import { VStack } from '@lib/ui/layout/Stack'
import { updateAtIndex } from '@lib/utils/array/updateAtIndex'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { Checkbox } from '../../../lib/ui/inputs/checkbox/Checkbox'
import { sendTerms, useSendTerms } from './state/sendTerms'

const Item = styled(Checkbox)`
  ${verticalPadding(10)}
`

export const SendTerms = () => {
  const { t } = useTranslation()

  const [value, setValue] = useSendTerms()

  return (
    <VStack>
      {sendTerms.map((term, index) => {
        return (
          <Item
            key={index}
            label={t(term)}
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
