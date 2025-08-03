import { PopupApiInterface } from './interface'

export type PopupApiResolverParams<K extends keyof PopupApiInterface> = {
  input: PopupApiInterface[K]['input']
}

export type PopupApiResolver<K extends keyof PopupApiInterface> = (
  params: PopupApiResolverParams<K>
) => Promise<PopupApiInterface[K]['output']>
