import { useCurrentSendCoin } from '../../state/sendCoin'

export const useSender = () => {
  const { address } = useCurrentSendCoin()

  return address
}
