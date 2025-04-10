import { interactive } from '@lib/ui/css/interactive'
import { useBoolean } from '@lib/ui/hooks/useBoolean'
import { text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { InputContainer } from '../../../lib/ui/inputs/InputContainer'
import { InputLabel } from '../../../lib/ui/inputs/InputLabel'
import { TextInput } from '../../../lib/ui/inputs/TextInput'
import { CollapsableStateIndicator } from '../../../lib/ui/layout/CollapsableStateIndicator'
import { useSendMemo } from '../state/memo'

const Input = styled(TextInput)`
  ${text({
    family: 'mono',
    weight: 400,
  })}
`

const Label = styled(InputLabel)`
  ${interactive};
  ${text({
    centerVertically: true,
  })}

  gap: 8px;

  svg {
    font-size: 16px;
  }
`

export const ManageMemo = () => {
  const [value, setValue] = useSendMemo()

  const { t } = useTranslation()

  const [isOpen, { toggle }] = useBoolean(!!value)

  return (
    <InputContainer>
      <Label onClick={toggle}>
        <span>
          {t('memo')} ({t('optional')})
        </span>
        <CollapsableStateIndicator isOpen={isOpen} />
      </Label>
      {isOpen && (
        <Input
          placeholder={t('enter_memo')}
          value={value}
          onValueChange={setValue}
        />
      )}
    </InputContainer>
  )
}
