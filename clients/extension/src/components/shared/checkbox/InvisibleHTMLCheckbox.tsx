import { InputProps } from '@lib/ui/props'
import React from 'react'
import styled from 'styled-components'

const InvisibleInput = styled.input`
  border: 0;
  clip: rect(0 0 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  width: 1px;
`

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
