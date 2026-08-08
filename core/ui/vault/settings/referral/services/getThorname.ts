import { queryUrl } from '@vultisig/lib-utils/query/queryUrl'

import { thorchainNodeBaseUrl } from '../config'

export const checkAvailability = async (name: string): Promise<boolean> => {
  const data = await queryUrl<Partial<{ code: number }>>(
    `${thorchainNodeBaseUrl}/thorname/${name}`
  )

  return data.code !== 0
}
