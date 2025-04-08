import { FastVaultKeygenFlow } from '../../keygen/shared/FastVaultKeygenFlow'
import { CurrentKeygenTypeProvider } from '../../keygen/state/currentKeygenType'

export const FastReshareVaultPage = () => {
  return (
    <CurrentKeygenTypeProvider value={'reshare'}>
      <FastVaultKeygenFlow />
    </CurrentKeygenTypeProvider>
  )
}
