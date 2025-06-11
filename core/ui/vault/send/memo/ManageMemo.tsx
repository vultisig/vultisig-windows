import { useCore } from '@core/ui/state/core'
import { useSendMemo } from '@core/ui/vault/send/state/memo'
import { ActionInsideInteractiveElement } from '@lib/ui/base/ActionInsideInteractiveElement'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { iconButtonSize } from '@lib/ui/buttons/IconButton'
import { interactive } from '@lib/ui/css/interactive'
import {
  textInputHeight,
  textInputHorizontalPadding,
} from '@lib/ui/css/textInput'
import { useBoolean } from '@lib/ui/hooks/useBoolean'
import { PasteIcon } from '@lib/ui/icons/PasteIcon'
import { InputContainer } from '@lib/ui/inputs/InputContainer'
import { InputLabel } from '@lib/ui/inputs/InputLabel'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { CollapsableStateIndicator } from '@lib/ui/layout/CollapsableStateIndicator'
import { Text, text } from '@lib/ui/text'
import { attempt } from '@lib/utils/attempt'
import { motion } from 'framer-motion'
import { AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

export const ManageMemo = () => {
  const [value, setValue] = useSendMemo()
  const { t } = useTranslation()
  const [isOpen, { toggle }] = useBoolean(!!value)
  const { getClipboardText } = useCore()

  return (
    <InputContainer>
      <Label onClick={toggle}>
        <Text as="span" color="shy" size={12}>
          {t('add_memo')}
        </Text>
        <CollapsableStateIndicator isOpen={isOpen} />
      </Label>
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            key="memo"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <ActionInsideInteractiveElement
              render={() => (
                <TextInput
                  placeholder={t('enter_memo')}
                  value={value}
                  onValueChange={setValue}
                />
              )}
              action={
                <IconButton
                  onClick={async () => {
                    const { data } = await attempt(getClipboardText)

                    if (data) {
                      setValue(data)
                    }
                  }}
                >
                  <PasteIcon />
                </IconButton>
              }
              actionPlacerStyles={{
                bottom: (textInputHeight - iconButtonSize.md) / 2,
                right: textInputHorizontalPadding,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </InputContainer>
  )
}

const Label = styled(InputLabel)`
  ${interactive};
  ${text({
    centerVertically: true,
  })}

  gap: 8px;

  svg {
    font-size: 16px;
  }
`
