import { mayachainPoolsEndpoint } from '../config'
import { MayaChainPool } from '../types/mayaChain'

export const fetchMayaChainAssets = async (): Promise<MayaChainPool[]> => {
  try {
    const response = await fetch(mayachainPoolsEndpoint)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    throw new Error(`Error fetching mayachain bondable assets: ${error}`)
  }
}
