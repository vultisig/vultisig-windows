import { queryUrl } from '@vultisig/lib-utils/query/queryUrl'

import { mayachainPoolsEndpoint } from '../config'
import { MayaChainPool } from '../types/mayaChain'

export const fetchMayaChainAssets = async (): Promise<MayaChainPool[]> =>
  queryUrl<MayaChainPool[]>(mayachainPoolsEndpoint)
