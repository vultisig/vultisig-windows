import { InputProps } from '@lib/ui/props'
import React from 'react'

import { InvisibleInput } from './InvisibleInput'

export type InvisibleHTMLCheckboxProps = InputProps<boolean> & {
  id?: string
  groupName?: string
}

export const InvisibleHTMLCheckbox: React.FC<InvisibleHTMLCheckboxProps> = ({
  id,
  value,
  onChange,
  groupName,
}) => (
  <InvisibleInput
    type="checkbox"
    checked={value}
    name={groupName}
    value={id}
    onChange={event => onChange(event.target.checked)}
  />
)
