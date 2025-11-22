import { queryUrl } from '@lib/utils/query/queryUrl'

export type Plugin = {
  category_id: string
  created_at: string
  description: string
  id: string
  logo_url: string
  pricing_id: string
  server_endpoint: string
  title: string
  updated_at: string
}

export const getPlugin = async (baseUrl: string, id: string) =>
  queryUrl<{ data: Plugin }>(`${baseUrl}/plugins/${id}`).then(
    ({ data }) => data
  )
