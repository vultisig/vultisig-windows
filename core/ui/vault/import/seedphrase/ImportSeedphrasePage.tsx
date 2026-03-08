import { ImportSeedphraseActiveStep } from './ImportSeedphraseActiveStep'
import { MnemonicProvider } from './state/mnemonic'
import { MoneroBirthdayProvider } from './state/moneroBirthday'
import { SelectedChainsProvider } from './state/selectedChains'
import { ImportSeedphraseStepProvider } from './state/step'
import { UsePhantomSolanaPathProvider } from './state/usePhantomSolanaPath'
import { ZcashBirthdayProvider } from './state/zcashBirthday'

export const ImportSeedphrasePage = () => {
  return (
    <MnemonicProvider initialValue="">
      <SelectedChainsProvider initialValue={[]}>
        <UsePhantomSolanaPathProvider initialValue={false}>
          <ZcashBirthdayProvider initialValue={null}>
            <MoneroBirthdayProvider initialValue={null}>
              <ImportSeedphraseStepProvider initialValue="intro">
                <ImportSeedphraseActiveStep />
              </ImportSeedphraseStepProvider>
            </MoneroBirthdayProvider>
          </ZcashBirthdayProvider>
        </UsePhantomSolanaPathProvider>
      </SelectedChainsProvider>
    </MnemonicProvider>
  )
}
