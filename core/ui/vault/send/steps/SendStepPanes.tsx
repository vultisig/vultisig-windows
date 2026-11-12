import { pageConfig } from '@lib/ui/page/config'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ReactNode, useState } from 'react'
import styled from 'styled-components'

import { ManageReceiverAddressInputField } from '../addresses/components/ManageAddressesInputField'
import { ManageAmountInputField } from '../amount/ManageAmountInputField'
import { getSendStepIndex, SendStep } from '../form/sendSteps'
import { useSendFormFieldState } from '../state/formFields'
import { SendAssetStep } from './asset/SendAssetStep'

const panes: Record<SendStep, () => ReactNode> = {
  coin: () => <SendAssetStep />,
  address: () => <ManageReceiverAddressInputField />,
  amount: () => <ManageAmountInputField />,
}

type SlideDirection = 1 | -1

type PaneMotion = {
  direction: SlideDirection
  shouldReduceMotion: boolean
}

const paneTransitionDurationS = 0.3

const paneVariants = {
  enter: ({ direction, shouldReduceMotion }: PaneMotion) =>
    shouldReduceMotion
      ? { opacity: 0 }
      : { opacity: 0, x: `${direction * 100}%` },
  shown: { opacity: 1, x: 0 },
  exit: ({ direction, shouldReduceMotion }: PaneMotion) =>
    shouldReduceMotion
      ? { opacity: 0 }
      : { opacity: 0, x: `${-direction * 100}%` },
}

/**
 * Shows the current send step. Moving forward slides the next step in from
 * the trailing edge, moving back from the leading edge; with reduced motion
 * the steps crossfade.
 */
export const SendStepPanes = () => {
  const [{ field: step }] = useSendFormFieldState()
  const shouldReduceMotion = useReducedMotion() === true
  const [shown, setShown] = useState<{
    step: SendStep
    direction: SlideDirection
  }>({ step, direction: 1 })

  if (shown.step !== step) {
    setShown({
      step,
      direction: getSendStepIndex(step) > getSendStepIndex(shown.step) ? 1 : -1,
    })
  }

  const paneMotion: PaneMotion = {
    direction: shown.direction,
    shouldReduceMotion,
  }

  return (
    <Stage>
      <AnimatePresence initial={false} custom={paneMotion}>
        <Pane
          key={step}
          custom={paneMotion}
          variants={paneVariants}
          initial="enter"
          animate="shown"
          exit="exit"
          transition={{ duration: paneTransitionDurationS, ease: 'easeInOut' }}
          data-testid={`send-step-pane-${step}`}
        >
          {panes[step]()}
        </Pane>
      </AnimatePresence>
    </Stage>
  )
}

const Stage = styled.div`
  display: grid;
  overflow-x: clip;
`

const Pane = styled(motion.div)`
  grid-area: 1 / 1;
  min-width: 0;
  padding-inline: ${pageConfig.horizontalPadding}px;
`
