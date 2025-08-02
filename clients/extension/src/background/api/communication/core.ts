import { productName } from '@core/config'
import { Result } from '@lib/utils/types/Result'

export type Request = {
  id: string
  source: string
  method: string
  input: any
}

export type Response = {
  id: string
  source: string
  result: Result<any, Error>
}

export const inpageSource = `${productName}-inpage`
export const contentSource = `${productName}-content`
