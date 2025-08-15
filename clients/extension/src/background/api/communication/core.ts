import {
  BackgroundInterface,
  BackgroundMethod,
} from '@core/inpage-provider/background/interface'

export type BackgroundApiCall<M extends BackgroundMethod> = {
  [K in M]: BackgroundInterface[K]['input']
}

export type BackgroundApiMessage = {
  call: BackgroundApiCall<any>
}
