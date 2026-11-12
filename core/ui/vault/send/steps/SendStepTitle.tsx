import { Text } from '@lib/ui/text'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

import { SendStep } from '../form/sendSteps'
import { useSendFormFieldState } from '../state/formFields'

const stepTitleKeys = {
  coin: 'send_step_choose_asset',
  address: 'send_step_enter_address',
  amount: 'send_step_enter_amount',
} as const satisfies Record<SendStep, string>

const titleFadeDurationS = 0.2

/** The title of the send step on screen; it crossfades as the step changes. */
export const SendStepTitle = () => {
  const { t } = useTranslation()
  const [{ field }] = useSendFormFieldState()

  return (
    <AnimatePresence initial={false} mode="wait">
      <motion.div
        key={field}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: titleFadeDurationS }}
      >
        <Text as="h2" variant="title2" color="contrast" centerHorizontally>
          {t(stepTitleKeys[field])}
        </Text>
      </motion.div>
    </AnimatePresence>
  )
}
