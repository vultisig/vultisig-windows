import { queryUrl } from '@lib/utils/query/queryUrl'

import { thorchainNodeBaseUrl } from '../config'

export const checkAvailability = async (name: string): Promise<boolean> => {
  try {
    const data = await queryUrl<{ code: number }>(
      `${thorchainNodeBaseUrl}/thorname/${name}`
    )

    return !('code' in data && data.code === 0)
  } catch {
    return true
  }
}
