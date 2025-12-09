import { ThorchainStakePosition } from '../../types'
import { fetchRujiStakePosition } from './rujiStakeService'
import { fetchStcyStakePosition } from './stcyStakeService'
import { fetchTcyStakePosition } from './tcyStakeService'

type FetchStakePositionsInput = {
  address: string
  prices: Record<string, number>
}

export const fetchStakePositions = async ({
  address,
  prices,
}: FetchStakePositionsInput) => {
  const [tcy, stcy, ruji] = await Promise.all([
    fetchTcyStakePosition({ address, prices }),
    fetchStcyStakePosition({ address, prices }),
    fetchRujiStakePosition({ address, prices }),
  ])

  const positions = [tcy, stcy, ruji].filter(
    (p): p is ThorchainStakePosition => p !== null
  )
  return { positions }
}
