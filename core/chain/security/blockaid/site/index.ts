import { queryBlockaid } from '../core/query'

type BlockaidSiteScanResponse = {
  is_malicious: boolean
}

export const scanSiteWithBlockaid = async (url: string) => {
  const { is_malicious } = await queryBlockaid<BlockaidSiteScanResponse>(
    '/site/scan',
    {
      metadata: { type: 'catalog' },
      url,
    }
  )

  return is_malicious ? 'malicious' : null
}
