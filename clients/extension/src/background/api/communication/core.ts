import {
  BackgroundInterface,
  BackgroundMethodName,
} from '@core/inpage-provider/background/interface'

export type BackgroundApiCall<M extends BackgroundMethodName> = {
  [K in M]: BackgroundInterface[K]['input']
}

export type BackgroundApiMessage = {
  call: BackgroundApiCall<any>
}
