import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCore } from '@core/ui/state/core'
import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { VStack } from '@lib/ui/layout/Stack'
import { fitPageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import styled from 'styled-components'

import { EnterSeedphraseStep } from './EnterSeedphraseStep'
import { ImportSeedphraseIntroStep } from './intro/ImportSeedphraseIntro'
import { MnemonicProvider } from './state/mnemonic'

const steps = ['intro', 'input'] as const

const Container = styled.div`
  ${fitPageContent({
    contentMaxWidth: 360,
  })}
`

export const ImportSeedphrasePage = () => {
  const { goBack } = useCore()
  const { step, toNextStep, toPreviousStep } = useStepNavigation({
    steps,
    onExit: goBack,
  })

  return (
    <MnemonicProvider initialValue="">
      <VStack fullHeight>
        <PageHeader
          primaryControls={<PageHeaderBackButton onClick={toPreviousStep} />}
        />
        <Container>
          <Match
            value={step}
            intro={() => <ImportSeedphraseIntroStep onFinish={toNextStep} />}
            input={() => (
              <EnterSeedphraseStep onFinish={() => console.log('importing')} />
            )}
          />
        </Container>
      </VStack>
    </MnemonicProvider>
  )
}
