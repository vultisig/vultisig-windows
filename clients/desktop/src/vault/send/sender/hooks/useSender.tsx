import { useCurrentVaultAddress } from '../../../state/currentVault'
import { useCurrentSendCoin } from '../../state/sendCoin'

export const useSender = () => {
  const [{ chain }] = useCurrentSendCoin()
  return useCurrentVaultAddress(chain)
}
