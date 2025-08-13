import { BlockaidValidation, parseBlockaidValidation } from '../api/core'
import { queryBlockaid } from '../api/query'
import { BlockaidTxScanResolver } from '../resolver'

type SolanaBlockaidScanResponse = {
  result: {
    validation: BlockaidValidation
  }
}

export const scanSolanaTxWithBlockaid: BlockaidTxScanResolver = async ({
  data,
}) => {
  const { result } = await queryBlockaid<SolanaBlockaidScanResponse>(
    '/solana/message/scan',
    data
  )

  return parseBlockaidValidation(result.validation)
}
