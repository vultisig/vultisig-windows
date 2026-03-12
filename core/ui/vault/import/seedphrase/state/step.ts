import { setupStateProvider } from '@lib/ui/state/setupStateProvider'

export type ImportSeedphraseStep =
  | 'intro'
  | 'input'
  | 'scan'
  | 'scanResult'
  | 'chains'

export const [ImportSeedphraseStepProvider, useImportSeedphraseStep] =
  setupStateProvider<ImportSeedphraseStep>('ImportSeedphraseStep')
