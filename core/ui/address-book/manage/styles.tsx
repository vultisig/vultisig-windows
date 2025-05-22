import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainEntityIconSrc } from '@core/ui/chain/coin/icon/utils/getChainEntityIconSrc'
import { HStack } from '@lib/ui/layout/Stack'
import { motion } from 'framer-motion'
import {
  components,
  MenuProps,
  OptionProps,
  SingleValueProps,
  StylesConfig,
} from 'react-select'

export type ChainOption = {
  value: string
  label: string
  logo: string
  isLastOption: boolean
}

export const customSelectStyles: StylesConfig<ChainOption, false> = {
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

export const customSelectMenu = ({
  children,
  innerProps,
}: MenuProps<ChainOption, false>) => (
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

export const customSelectOption = (props: OptionProps<ChainOption, false>) => (
  <components.Option {...props}>
    <HStack alignItems="center" gap={8}>
      <ChainEntityIcon
        value={getChainEntityIconSrc(props.data.value)}
        style={{ fontSize: 24 }}
      />
      {props.data.label}
    </HStack>
  </components.Option>
)

export const customSingleValue = (
  props: SingleValueProps<ChainOption, false>
) => (
  <components.SingleValue {...props}>
    <HStack alignItems="center" gap={8}>
      <ChainEntityIcon
        value={getChainEntityIconSrc(props.data.value)}
        style={{ fontSize: 24 }}
      />
      {props.data.label}
    </HStack>
  </components.SingleValue>
)
