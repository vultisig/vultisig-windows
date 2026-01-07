import { useSelectedChains } from '../state/selectedChains'
import { ActiveChainsFoundContent } from './ActiveChainsFoundContent'
import { NoChainsFoundContent } from './NoChainsFoundContent'

export const ScanResultStep = () => {
  const [selectedChains] = useSelectedChains()

  if (selectedChains.length === 0) {
    return <NoChainsFoundContent />
  }

  return <ActiveChainsFoundContent />
}
