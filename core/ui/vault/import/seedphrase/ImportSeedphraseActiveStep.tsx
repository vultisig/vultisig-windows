import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCore } from '@core/ui/state/core'
import { VStack } from '@lib/ui/layout/Stack'
import { fitPageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { ComponentType } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { EnterSeedphraseStep } from './EnterSeedphraseStep'
import { ImportSeedphraseIntroStep } from './intro/ImportSeedphraseIntro'
import { ScanningChainsStep } from './ScanningChainsStep'
import { ScanResultStep } from './scanResult'
import { SelectChainsStep } from './SelectChainsStep'
import { useMnemonic } from './state/mnemonic'
import { ImportSeedphraseStep, useImportSeedphraseStep } from './state/step'

const stepTitles: Partial<Record<ImportSeedphraseStep, string>> = {
  scan: 'import_seedphrase',
  chains: 'select_chains',
}

const Container = styled.div`
  ${fitPageContent({
    contentMaxWidth: 360,
  })}
  min-height:fit-content;
`

const stepComponents: Record<ImportSeedphraseStep, ComponentType> = {
  intro: ImportSeedphraseIntroStep,
  input: EnterSeedphraseStep,
  scan: ScanningChainsStep,
  scanResult: ScanResultStep,
  chains: SelectChainsStep,
}

const backSteps: Record<ImportSeedphraseStep, ImportSeedphraseStep | null> = {
  intro: null,
  input: 'intro',
  scan: 'input',
  scanResult: 'input',
  chains: 'input',
}

export const ImportSeedphraseActiveStep = () => {
  const { t } = useTranslation()
  const { goBack } = useCore()
  const [step, setStep] = useImportSeedphraseStep()
  const [, setMnemonic] = useMnemonic()

  const handleBack = () => {
    const nextStep = backSteps[step]

    if (nextStep) {
      if (step === 'input') {
        setMnemonic('')
      }
      setStep(nextStep)
    } else {
      goBack()
    }
  }

  const titleKey = stepTitles[step]
  const StepComponent = stepComponents[step]

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={handleBack} />}
        title={titleKey ? t(titleKey as any) : undefined}
      />
      <Container>
        <StepComponent />
      </Container>
    </VStack>
  )
}
