import { IconButton } from '@lib/ui/buttons/IconButton'
import { PasteIcon } from '@lib/ui/icons/PasteIcon'
import { StationCopies3FilledIcon } from '@lib/ui/icons/StationFigmaIcons'
import { UiProps } from '@lib/ui/props'
import { attempt } from '@vultisig/lib-utils/attempt'
import { ReactNode } from 'react'
import { useTheme } from 'styled-components'

import { useCore } from '../state/core'

type InputPasteActionProps = {
  onPaste: (value: string) => void
  /** Replaces the default paste glyph. */
  icon?: ReactNode
}

export const InputPasteAction = ({
  onPaste,
  icon,
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
      {icon ??
        (iconStyle === 'station' ? (
          <StationCopies3FilledIcon />
        ) : (
          <PasteIcon />
        ))}
    </IconButton>
  )
}
