import { queryUrl } from '@lib/utils/query/queryUrl'

export const getEvmContractCallSignatures = (hexSignature: string) =>
  queryUrl<{
    count: number
    results: { text_signature: string }[]
  }>(
    `https://www.4byte.directory/api/v1/signatures/?format=json&hex_signature=${hexSignature}&ordering=created_at`
  )
