import { useEffect } from 'react'

import { useSendFormFieldState } from '../../state/formFields'

export const useAutoCoinCheck = () => {
  const [{ field, fieldsChecked }, setFormState] = useSendFormFieldState()

  // @tony: Side effect needed due to product requirement: https://github.com/vultisig/vultisig-windows/issues/2009
  useEffect(() => {
    if (field !== 'coin' && !fieldsChecked.coin) {
      setFormState(s => ({
        ...s,
        fieldsChecked: { ...s.fieldsChecked, coin: true },
      }))
    }
  }, [field, fieldsChecked.coin, setFormState])
}
