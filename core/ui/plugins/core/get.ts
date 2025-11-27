import { RecipeSchema } from '@core/mpc/types/plugin/recipe_specification_pb'
import { queryUrl } from '@lib/utils/query/queryUrl'
import { toCamelCase } from '@lib/utils/toCamelCase'

export type Plugin = {
  category_id: string
  created_at: string
  description: string
  id: string
  logo_url: string
  permissions: string[]
  pricing_id: string
  server_endpoint: string
  title: string
  updated_at: string
}

export const getPlugin = async (baseUrl: string, id: string) =>
  queryUrl<{ data: Plugin }>(`${baseUrl}/plugins/${id}`).then(
    ({ data: plugin }) =>
      queryUrl<{ data: RecipeSchema }>(
        `${baseUrl}/plugins/${id}/recipe-specification`
      )
        .then(({ data }) => {
          const { supportedResources } = toCamelCase<RecipeSchema>(data)

          return {
            ...plugin,
            permissions: supportedResources.reduce<string[]>(
              (acc, { resourcePath }) => {
                if (!resourcePath || !resourcePath.functionId) return acc

                if (!acc.includes(resourcePath.functionId))
                  acc.push(resourcePath.functionId)

                return acc
              },
              []
            ),
          }
        })
        .catch(() => ({ ...plugin, permissions: [] }) as Plugin)
  )
