import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { CoinsIcon } from '@lib/ui/icons/CoinsIcon'
import { PinFilledIcon } from '@lib/ui/icons/PinFilledIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { SvgProps } from '@lib/ui/props'
import { getColor } from '@lib/ui/theme/getters'
import { motion, useReducedMotion } from 'framer-motion'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { CalculatorIcon } from '../../../agent/icons/CalculatorIcon'
import {
  canNavigateToSendStep,
  getSendStepState,
  SendStep,
  sendSteps,
  SendStepState,
} from '../form/sendSteps'
import { useSendFormFieldState } from '../state/formFields'
import { useSendStepCompletion } from './useSendStepCompletion'

const stepIcons = {
  coin: CoinsIcon,
  address: PinFilledIcon,
  amount: CalculatorIcon,
} satisfies Record<SendStep, FC<SvgProps>>

const stepLabelKeys = {
  coin: 'asset',
  address: 'address',
  amount: 'amount',
} as const satisfies Record<SendStep, string>

const completedPopScale = [1, 1.08, 1]
const completedPopDurationS = 0.35
const stateFadeDurationS = 0.3

/**
 * The send flow's step icons. A step can be tapped once every step before it
 * is complete; completing a step turns its icon green with a small pop.
 */
export const SendStepHeader = () => {
  const { t } = useTranslation()
  const [{ field: current }, setStep] = useSendFormFieldState()
  const completion = useSendStepCompletion()
  const shouldReduceMotion = useReducedMotion() === true

  return (
    <HStack alignItems="center" justifyContent="center" gap={12}>
      {sendSteps.map((step, index) => {
        const Icon = stepIcons[step]
        const state = getSendStepState({ step, current, completion })
        const canNavigate = canNavigateToSendStep({
          step,
          current,
          completion,
        })

        return (
          <HStack key={step} alignItems="center" gap={12}>
            {index > 0 && <Connector />}
            <StepButton
              aria-label={t(stepLabelKeys[step])}
              aria-current={step === current ? 'step' : undefined}
              disabled={!canNavigate}
              data-testid={`send-step-${step}`}
              data-state={state}
              onClick={() => setStep(prev => ({ ...prev, field: step }))}
            >
              <AnimatedStepCircle
                $state={state}
                initial={false}
                animate={{
                  scale:
                    state === 'completed' && !shouldReduceMotion
                      ? completedPopScale
                      : 1,
                }}
                transition={{ duration: completedPopDurationS }}
              >
                <Icon />
              </AnimatedStepCircle>
            </StepButton>
          </HStack>
        )
      })}
    </HStack>
  )
}

const StepButton = styled(UnstyledButton)`
  ${borderRadius.pill};

  &:disabled {
    cursor: default;
  }

  &:focus-visible {
    outline: 1px solid ${getColor('primaryAccentFour')};
    outline-offset: 2px;
  }
`

const stepCircleSizePx = 36
const stepGlyphSizePx = 20
const stepRingWidthPx = 2
const activeGlowAlpha = 0.8
const completedFillAlpha = 0.05

/** Same three looks as the iOS and Android step icons. */
const stepCircleStyles: Record<SendStepState, ReturnType<typeof css>> = {
  active: css`
    color: ${getColor('primaryAccentFour')};
    background:
      radial-gradient(
        18px 10px at 50% 100%,
        ${({ theme }) =>
          theme.colors.buttonPrimary.withAlpha(activeGlowAlpha).toCssValue()},
        transparent
      ),
      ${getColor('background')};
    box-shadow: inset 0 0 0 ${stepRingWidthPx}px ${getColor('mistExtra')};
  `,
  completed: css`
    color: ${getColor('success')};
    background: ${({ theme }) =>
      theme.colors.success.withAlpha(completedFillAlpha).toCssValue()};
  `,
  upcoming: css`
    color: ${getColor('foregroundExtra')};
    background: ${getColor('background')};
    box-shadow: inset 0 0 0 ${stepRingWidthPx}px ${getColor('foregroundExtra')};
  `,
}

const AnimatedStepCircle = styled(motion.div)<{ $state: SendStepState }>`
  width: ${stepCircleSizePx}px;
  height: ${stepCircleSizePx}px;
  ${borderRadius.pill};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${stepGlyphSizePx}px;
  ${({ $state }) => stepCircleStyles[$state]};
  transition:
    color ${stateFadeDurationS}s ease-in-out,
    background ${stateFadeDurationS}s ease-in-out,
    box-shadow ${stateFadeDurationS}s ease-in-out;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`

const Connector = styled.div`
  width: 16px;
  height: 1px;
  ${borderRadius.pill};
  background: ${getColor('foregroundExtra')};
`
