import { motion } from 'framer-motion'
import React from 'react'
import { MenuProps, StylesConfig } from 'react-select'
import styled from 'styled-components'

import { Input } from '../../../../../lib/ui/inputs/text-input/Input'
import { Panel } from '../../../../../lib/ui/panel/Panel'
import { getColor } from '../../../../../lib/ui/theme/getters'

export const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: 32px;
`

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;

  & > :first-child {
    padding: 8px;
  }
`

export const FormField = styled(Panel)`
  font-weight: 400;
  font-size: 16px;

  display: flex;
  flex-direction: column;
  gap: 12px;
`

export const FormFieldLabel = styled.label`
  font-weight: 500;
  color: ${getColor('contrast')};
  display: inline-block;
  margin-bottom: 6px;
`

export const FormInput = styled(Input)`
  color: ${getColor('contrast')};
  background-color: ${getColor('foreground')};

  &::placeholder {
    font-size: 13px;
    color: ${getColor('textShy')};
  }
`

export type CoinOption = {
  value: string
  label: string
  logo: string
  isLastOption: boolean
}

export const customSelectStyles: StylesConfig<CoinOption, false> = {
  control: base => ({
    ...base,
    backgroundColor: 'transparent',
    color: 'white',
    borderRadius: '5px',
    padding: '5px',
    border: 'none',
    boxShadow: 'none',
    '&:hover': {
      border: 'none',
    },
  }),
  menu: base => ({
    ...base,
    backgroundColor: 'transparent',
    borderRadius: '5px',
    marginTop: '5px',
    boxShadow: 'none',
  }),
  option: (base, { data }) => ({
    ...base,
    backgroundColor: 'none',
    borderBottom: data.isLastOption ? 'none' : '2px solid #ffffff47',
    color: 'white',
    padding: '10px',
    cursor: 'pointer',
  }),
  singleValue: base => ({
    ...base,
    display: 'flex',
    alignItems: 'center',
    color: 'white',
  }),
  dropdownIndicator: base => ({
    ...base,
    border: 'none',
    color: 'white',
    '&:hover': {
      color: '#888',
    },
  }),
  indicatorSeparator: base => ({
    ...base,
    backgroundColor: 'transparent',
  }),
  menuList: base => ({
    ...base,
    padding: '0',
  }),
}

export const customSelectMenu = (props: MenuProps<CoinOption, false>) => {
  const { children, innerProps } = props
  return (
    <motion.div
      {...(innerProps as any)}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  )
}

export const ButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`
