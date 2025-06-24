import { KeygenStep } from '@core/mpc/keygen/KeygenStep'
import { KeygenProductEducation } from '@core/ui/mpc/keygen/education/product/KeygenProductEducation'
import { KeygenProgressIndicator } from '@core/ui/mpc/keygen/progress/KeygenProgressIndicator'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { ValueProp } from '@lib/ui/props'

export const KeygenPendingState = ({ value }: ValueProp<KeygenStep | null>) => {
  return (
    <>
      <PageContent alignItems="center" justifyContent="center" scrollable>
        <VStack maxWidth={576} fullWidth>
          <KeygenProductEducation />
        </VStack>
      </PageContent>
      <PageFooter alignItems="center">
        <VStack alignItems="center" maxWidth={576} fullWidth>
          <KeygenProgressIndicator value={value} />
        </VStack>
      </PageFooter>
    </>
  )
}
