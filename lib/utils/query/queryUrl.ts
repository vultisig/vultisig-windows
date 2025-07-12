import { assertFetchResponse } from '../fetch/assertFetchResponse'

type ResponseType = 'json' | 'text' | 'none'

type QueryUrlOptions = RequestInit & {
  responseType?: ResponseType
}

export function queryUrl(
  url: string | URL,
  options: QueryUrlOptions & { responseType: 'none' }
): Promise<void>

export function queryUrl<T>(
  url: string | URL,
  options?: QueryUrlOptions & { responseType?: 'json' | 'text' }
): Promise<T>

export async function queryUrl<T>(
  url: string | URL,
  options: QueryUrlOptions = {}
): Promise<T | void> {
  const { responseType = 'json', ...rest } = options
  const response = await fetch(url, {
    method: 'GET',
    ...rest,
  })

  await assertFetchResponse(response)

  if (responseType !== 'none') {
    return response[responseType]()
  }
}
