import { IconButton } from '@lib/ui/buttons/IconButton'
import { PasteIcon } from '@lib/ui/icons/PasteIcon'
import { StationCopies3FilledIcon } from '@lib/ui/icons/StationFigmaIcons'
import { UiProps } from '@lib/ui/props'
import { attempt } from '@vultisig/lib-utils/attempt'
import { useTheme } from 'styled-components'

import { useCore } from '../state/core'

type InputPasteActionProps = {
  onPaste: (value: string) => void
}

export const InputPasteAction = ({
  onPaste,
  ...rest
}: InputPasteActionProps & UiProps) => {
  const { getClipboardText } = useCore()
  const { iconStyle } = useTheme()

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
      {iconStyle === 'station' ? <StationCopies3FilledIcon /> : <PasteIcon />}
    </IconButton>
  )
}
