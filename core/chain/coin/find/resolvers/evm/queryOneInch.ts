import { rootApiUrl } from '@core/config'
import { sleep } from '@core/mpc/sleep'
import { NoDataError } from '@lib/utils/error/NoDataError'
import { assertFetchResponse } from '@lib/utils/fetch/assertFetchResponse'

let lastRequestAt: number | null = null
const minTimeGap = 500

export const queryOneInch = async <T>(urlParams: string): Promise<T> => {
  const now = Date.now()

  if (lastRequestAt && lastRequestAt + minTimeGap > now) {
    await sleep(lastRequestAt + minTimeGap - now)
    return queryOneInch(urlParams)
  }

  lastRequestAt = now
  const url = `${rootApiUrl}/1inch${urlParams}`
  const response = await fetch(url)

  if (response.status === 404) {
    throw new NoDataError()
  }

  if (response.status === 429) {
    await sleep(minTimeGap)
    return queryOneInch(urlParams)
  }

  if (!response.ok) {
    assertFetchResponse(response)
  }

  return response.json()
}
