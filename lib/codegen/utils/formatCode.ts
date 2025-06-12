import { match } from '@lib/utils/match'
import path from 'path'
import { format, resolveConfig } from 'prettier'

type FormatCodeParams = {
  extension: 'ts' | 'tsx' | 'json'
  content: string
}

export const formatCode = async ({ extension, content }: FormatCodeParams) => {
  const configPath = path.resolve(__dirname, '../../.prettierrc')

  const config = await resolveConfig(configPath)

  return format(content, {
    ...config,
    parser: match(extension, {
      ts: () => 'typescript',
      tsx: () => 'typescript',
      json: () => 'json',
    }),
  })
}
