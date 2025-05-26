import { Chain } from '@core/chain/Chain'
import { DropdownOptionContent } from '@lib/ui/inputs/dropdown/DropdownOptionContent'
import { SelectOptionInput } from '@lib/ui/inputs/dropdown/SelectOptionInput'
import { InputProps } from '@lib/ui/props'

import { ChainEntityIcon } from '../coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '../metadata/getChainLogoSrc'

export const ChainInput = ({ value, onChange }: InputProps<Chain>) => {
  return (
    <SelectOptionInput
      value={value}
      onChange={onChange}
      options={Object.values(Chain)}
      getOptionKey={chain => chain}
      renderOption={chain => (
        <DropdownOptionContent
          identifier={<ChainEntityIcon value={getChainLogoSrc(chain)} />}
          name={chain}
        />
      )}
      valueIdentifier={<ChainEntityIcon value={getChainLogoSrc(value)} />}
      valueName={value}
    />
  )
}
