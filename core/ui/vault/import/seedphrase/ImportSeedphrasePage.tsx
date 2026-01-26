import { ImportSeedphraseActiveStep } from './ImportSeedphraseActiveStep'
import { MnemonicProvider } from './state/mnemonic'
import { SelectedChainsProvider } from './state/selectedChains'
import { ImportSeedphraseStepProvider } from './state/step'
import { UsePhantomSolanaPathProvider } from './state/usePhantomSolanaPath'

export const ImportSeedphrasePage = () => {
  return (
    <MnemonicProvider initialValue="">
      <SelectedChainsProvider initialValue={[]}>
        <UsePhantomSolanaPathProvider initialValue={false}>
          <ImportSeedphraseStepProvider initialValue="intro">
            <ImportSeedphraseActiveStep />
          </ImportSeedphraseStepProvider>
        </UsePhantomSolanaPathProvider>
      </SelectedChainsProvider>
    </MnemonicProvider>
  )
}
