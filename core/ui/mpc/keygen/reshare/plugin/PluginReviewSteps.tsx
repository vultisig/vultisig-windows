import { Match } from '@lib/ui/base/Match'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { FlowPageHeader } from '@lib/ui/flow/FlowPageHeader'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { OnFinishProp } from '@lib/ui/props'

const pluginReviewSteps = ['pluginInfo', 'policyReview'] as const

export const PluginReviewSteps = ({ onFinish }: OnFinishProp) => {
  const { step, toPreviousStep, toNextStep } = useStepNavigation({
    steps: pluginReviewSteps,
    onExit: useNavigateBack(),
  })

  return (
    <VStack fullHeight>
      <FlowPageHeader
        title={step}
        onBack={step === 'policyReview' ? toPreviousStep : useNavigateBack}
      />
      <PageContent alignItems="center" flexGrow>
        <Match
          value={step}
          pluginInfo={() => <>Plugin Info </>}
          policyReview={() => <>Policy Review </>}
        />
      </PageContent>
      <PageFooter alignItems="center" gap={32}>
        <IconButton
          kind="primary"
          onClick={step === 'policyReview' ? onFinish : toNextStep}
          size="xl"
        >
          <ChevronRightIcon />
        </IconButton>
      </PageFooter>
    </VStack>
  )
}
