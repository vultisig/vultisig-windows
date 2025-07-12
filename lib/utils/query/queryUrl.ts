import { assertFetchResponse } from '../fetch/assertFetchResponse'

type ResponseType = 'json' | 'text'

type QueryUrlOptions = RequestInit & {
  responseType?: ResponseType
}

export const queryUrl = async <T>(
  url: string | URL,
  options: QueryUrlOptions = {}
): Promise<T> => {
  const { responseType = 'json', ...rest } = options
  const response = await fetch(url, {
    method: 'GET',
    ...rest,
  })

  await assertFetchResponse(response)

  return response[responseType]()
}
