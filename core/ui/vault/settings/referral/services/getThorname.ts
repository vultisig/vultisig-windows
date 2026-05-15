import { queryUrl } from '@vultisig/lib-utils/query/queryUrl'

import { thorchainNodeBaseUrl } from '../config'

export const checkAvailability = async (name: string): Promise<boolean> => {
  try {
    const data = await queryUrl<any>(`${thorchainNodeBaseUrl}/thorname/${name}`)
    const hasThoralias = data.aliases.some(
      (a: any) => a.chain?.toUpperCase() === 'THOR' && a.address
    )

    if (hasThoralias) {
      throw new Error('Already taken.')
    }

    return true
  } catch (err: any) {
    if (err?.message === 'Already taken.') {
      throw err
    }
    if (err?.message?.includes('fail to fetch THORName')) {
      return true
    }
    return true
  }
}
