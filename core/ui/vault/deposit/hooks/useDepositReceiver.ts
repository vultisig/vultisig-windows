import { useDepositData } from '../state/data'

export function useDepositReceiver() {
  const depositData = useDepositData()

  const nodeAddressRaw = depositData['nodeAddress']
  return typeof nodeAddressRaw === 'string' && nodeAddressRaw.length > 0
    ? nodeAddressRaw
    : undefined
}
