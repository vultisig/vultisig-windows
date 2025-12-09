import { ThorchainStakePosition } from '../../types'
import { fetchRujiStakePosition } from './rujiStakeService'
import { fetchStcyStakePosition } from './stcyStakeService'
import { fetchTcyStakePosition } from './tcyStakeService'

export const fetchStakePositions = async (
  address: string,
  prices: Record<string, number>
) => {
  const [tcy, stcy, ruji] = await Promise.all([
    fetchTcyStakePosition(address, prices),
    fetchStcyStakePosition(address, prices),
    fetchRujiStakePosition(address, prices),
  ])

  const positions = [tcy, stcy, ruji].filter(
    Boolean
  ) as ThorchainStakePosition[]
  return { positions }
}
