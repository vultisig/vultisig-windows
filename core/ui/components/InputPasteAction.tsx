import { IconButton } from '@lib/ui/buttons/IconButton'
import { PasteIcon } from '@lib/ui/icons/PasteIcon'
import { UiProps } from '@lib/ui/props'
import { attempt } from '@lib/utils/attempt'

import { useCore } from '../state/core'

type InputPasteActionProps = {
  onPaste: (value: string) => void
}

export const InputPasteAction = ({
  onPaste,
  ...rest
}: InputPasteActionProps & UiProps) => {
  const { getClipboardText } = useCore()

  return (
    <IconButton
      size="sm"
      onClick={async () => {
        const { data } = await attempt(getClipboardText)

        if (data) {
          onPaste(data)
        }
      }}
      {...rest}
    >
      <PasteIcon />
    </IconButton>
  )
}
