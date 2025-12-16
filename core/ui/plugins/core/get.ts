import { RecipeSchema } from '@core/mpc/types/plugin/recipe_specification_pb'
import { queryUrl } from '@lib/utils/query/queryUrl'
import { toCamelCase } from '@lib/utils/toCamelCase'

type AppPricing = {
  amount: number
  createdAt: string
  frequency: string
  id: string
  metric: string
  type: string
  updatedAt: string
}

export type Plugin = {
  category_id: string
  created_at: string
  description: string
  id: string
  logo_url: string
  permissions: string[]
  pricing: AppPricing[]
  server_endpoint: string
  title: string
  updated_at: string
}

export const getPlugin = async (baseUrl: string, id: string) =>
  queryUrl<{ data: Plugin & { pluginVersion: number } }>(
    `${baseUrl}/plugins/${id}`
  ).then(({ data: plugin }) =>
    queryUrl<{ data: RecipeSchema }>(
      `${baseUrl}/plugins/${id}/recipe-specification`
    )
      .then(({ data }) => {
        const { supportedResources, pluginVersion } =
          toCamelCase<RecipeSchema>(data)

        return {
          ...plugin,
          permissions: [
            ...supportedResources.reduce<string[]>((acc, { resourcePath }) => {
              if (!resourcePath || !resourcePath.functionId) return acc

              const id = resourcePath.functionId

              if (!acc.includes(id)) acc.push(id)

              return acc
            }, []),
            ...(plugin.pricing.length > 0
              ? ['Fee deduction authorization']
              : []),
            'Vault balance visibility',
          ],
          pluginVersion,
        }
      })
      .catch(
        () =>
          ({ ...plugin, permissions: [], pluginVersion: 0 }) as Plugin & {
            pluginVersion: number
          }
      )
  )
