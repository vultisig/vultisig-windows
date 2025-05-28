import { Text } from '@lib/ui/text'
import { useState } from 'react'

import { EnablePasscodeInput } from './EnablePasscodeInput'

export const ManagePasscode = () => {
  const [value, setValue] = useState(false)

  return (
    <>
      <EnablePasscodeInput value={value} onChange={setValue} />
      <Text>manage passcode...</Text>
    </>
  )
}
