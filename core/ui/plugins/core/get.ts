import { queryUrl } from '@lib/utils/query/queryUrl'

type Plugin = {
  id: string
  title: string
  description: string
  server_endpoint: string
  pricing_id: string
  category_id: string
  created_at: string
  updated_at: string
}

export const getPlugin = async (baseURL: string, id: string) =>
  queryUrl<Plugin>(`${baseURL}/plugins/${id}`)
