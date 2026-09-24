import { ImportSeedphraseActiveStep } from './ImportSeedphraseActiveStep'
import { MnemonicProvider } from './state/mnemonic'
import { SelectedChainsProvider } from './state/selectedChains'
import { ImportSeedphraseStepProvider } from './state/step'
import { UnscannedChainsProvider } from './state/unscannedChains'
import { UsePhantomSolanaPathProvider } from './state/usePhantomSolanaPath'

/**
 * Seedphrase import flow, holding the state shared across its steps.
 */
export const ImportSeedphrasePage = () => {
  return (
    <MnemonicProvider initialValue="">
      <SelectedChainsProvider initialValue={[]}>
        <UnscannedChainsProvider initialValue={[]}>
          <UsePhantomSolanaPathProvider initialValue={false}>
            <ImportSeedphraseStepProvider initialValue="intro">
              <ImportSeedphraseActiveStep />
            </ImportSeedphraseStepProvider>
          </UsePhantomSolanaPathProvider>
        </UnscannedChainsProvider>
      </SelectedChainsProvider>
    </MnemonicProvider>
  )
}
