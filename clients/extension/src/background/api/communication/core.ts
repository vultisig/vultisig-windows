import { BackgroundApiInterface, BackgroundApiMethodName } from '../interface'

export type BackgroundApiCall<M extends BackgroundApiMethodName> = {
  [K in M]: BackgroundApiInterface[K]['input']
}

export type BackgroundApiMessage = {
  call: BackgroundApiCall<any>
}
