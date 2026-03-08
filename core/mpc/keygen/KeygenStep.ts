export const keygenSteps = [
  'prepareVault',
  'ecdsa',
  'eddsa',
  'frozt',
  'fromt',
  'chainKeys',
  'mldsa',
] as const

export type KeygenStep = (typeof keygenSteps)[number]

export const makeStepAdvancer = (onStepChange: (step: KeygenStep) => void) => {
  let currentIndex = -1
  return (step: KeygenStep) => {
    const newIndex = keygenSteps.indexOf(step)
    if (newIndex > currentIndex) {
      currentIndex = newIndex
      onStepChange(step)
    }
  }
}
