import { MAYACHAIN_POOLS_ENDPOINT } from '../constants'
import { MayaChainPool } from '../types/mayaChain'

export const fetchMayaChainAssets = async (): Promise<MayaChainPool[]> => {
  try {
    const response = await fetch(MAYACHAIN_POOLS_ENDPOINT)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    throw new Error(`Error fetching mayachain bondable assets: ${error}`)
  }
}
