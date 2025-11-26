import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'

import { usePluginReshareStepsAnimations } from '../hooks/usePluginReshareStepsAnimations'
import { InstallPluginStep } from './InstallPluginStep'

type UsePluginReshareStepsAnimationsReturn = ReturnType<
  typeof usePluginReshareStepsAnimations
>

type PluginInstallAnimationContextValue = {
  currentStep: InstallPluginStep | null
  setCurrentStep: (step: InstallPluginStep | null) => void
  animationComponent: UsePluginReshareStepsAnimationsReturn['animationComponent']
  updateStatus: UsePluginReshareStepsAnimationsReturn['updateStatus']
}

const PluginInstallAnimationContext =
  createContext<PluginInstallAnimationContextValue | null>(null)

export const usePluginInstallAnimation = () => {
  const context = useContext(PluginInstallAnimationContext)
  return context
}

type PluginInstallAnimationProviderProps = {
  children: ReactNode
}

export const PluginInstallAnimationProvider: FC<
  PluginInstallAnimationProviderProps
> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState<InstallPluginStep | null>(null)

  const { animationComponent, updateStatus } = usePluginReshareStepsAnimations()

  useEffect(() => {
    if (currentStep && currentStep !== 'fastServer') {
      updateStatus(currentStep, true)
    }
  }, [currentStep, updateStatus])

  return (
    <PluginInstallAnimationContext.Provider
      value={{ currentStep, setCurrentStep, animationComponent, updateStatus }}
    >
      {children}
    </PluginInstallAnimationContext.Provider>
  )
}
