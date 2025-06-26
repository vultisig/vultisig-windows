import { KeygenStep, keygenSteps } from '@core/mpc/keygen/KeygenStep'

export const installPluginSteps = [
  'verifierServer',
  'pluginServer',
  'install',
] as const

export type InstallPluginStep = (typeof installPluginSteps)[number]

export const mapKeygenStepToInstallStep = (
  step: KeygenStep | null
): InstallPluginStep | null => {
  if (step && keygenSteps.includes(step)) {
    return 'install'
  }
  return null
}
