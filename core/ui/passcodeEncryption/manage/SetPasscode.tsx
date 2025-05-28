import { Text } from '@lib/ui/text'
import { useState } from 'react'

import { EnablePasscodeInput } from './EnablePasscodeInput'

export const SetPasscode = () => {
  const [value, setValue] = useState(false)

  return (
    <>
      <EnablePasscodeInput value={value} onChange={setValue} />
      <Text>set passcode...</Text>
    </>
  )
}
