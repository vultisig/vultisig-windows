import { useSendMemo } from '@core/ui/vault/send/state/memo'
import { interactive } from '@lib/ui/css/interactive'
import { useBoolean } from '@lib/ui/hooks/useBoolean'
import { InputContainer } from '@lib/ui/inputs/InputContainer'
import { InputLabel } from '@lib/ui/inputs/InputLabel'
import { CollapsableStateIndicator } from '@lib/ui/layout/CollapsableStateIndicator'
import { Text, text } from '@lib/ui/text'
import { motion } from 'framer-motion'
import { AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { TextInputWithPasteAction } from '../../../components/TextInputWithPasteAction'

export const ManageMemo = () => {
  const [value, setValue] = useSendMemo()
  const { t } = useTranslation()
  const [isOpen, { toggle }] = useBoolean(!!value)

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
            <TextInputWithPasteAction
              placeholder={t('enter_memo')}
              value={value}
              onValueChange={setValue}
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
