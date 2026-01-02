import { ImportSeedphraseActiveStep } from './ImportSeedphraseActiveStep'
import { MnemonicProvider } from './state/mnemonic'
import { SelectedChainsProvider } from './state/selectedChains'
import { ImportSeedphraseStepProvider } from './state/step'

export const ImportSeedphrasePage = () => {
  return (
    <MnemonicProvider initialValue="">
      <SelectedChainsProvider initialValue={[]}>
        <ImportSeedphraseStepProvider initialValue="intro">
          <ImportSeedphraseActiveStep />
        </ImportSeedphraseStepProvider>
      </SelectedChainsProvider>
    </MnemonicProvider>
  )
}
