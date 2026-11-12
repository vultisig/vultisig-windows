/** The plain send form's steps, in the order the user moves through them. */
export const sendSteps = ['coin', 'address', 'amount'] as const

/** One step of the plain send form. */
export type SendStep = (typeof sendSteps)[number]

/** Whether each step currently holds a value that lets the user move past it. */
export type SendStepCompletion = Record<SendStep, boolean>

/** How the step header draws a step. */
export type SendStepState = 'active' | 'completed' | 'upcoming'

type SendStepRuleInput = {
  step: SendStep
  current: SendStep
  completion: SendStepCompletion
}

/** Position of a step in the flow, used to tell forward from backward moves. */
export const getSendStepIndex = (step: SendStep) => sendSteps.indexOf(step)

/**
 * Whether the header may jump to `step`: every earlier step is complete and
 * `step` is not the one already shown.
 */
export const canNavigateToSendStep = ({
  step,
  current,
  completion,
}: SendStepRuleInput) =>
  step !== current &&
  sendSteps
    .slice(0, getSendStepIndex(step))
    .every(earlier => completion[earlier])

/** The header state of `step`: the shown step is active, others show completion. */
export const getSendStepState = ({
  step,
  current,
  completion,
}: SendStepRuleInput): SendStepState => {
  if (step === current) return 'active'

  return completion[step] ? 'completed' : 'upcoming'
}
