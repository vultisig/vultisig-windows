import { getStateProviderSetup } from '@lib/ui/state/getStateProviderSetup'

export type ImportSeedphraseStep = 'intro' | 'input' | 'scan' | 'chains'

export const {
  useState: useImportSeedphraseStep,
  provider: ImportSeedphraseStepProvider,
} = getStateProviderSetup<ImportSeedphraseStep>('ImportSeedphraseStep')
