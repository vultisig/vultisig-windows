import { BackgroundApiContext } from './context'
import { BackgroundApiInterface } from './interface'

export type BackgroundApiResolverParams<
  K extends keyof BackgroundApiInterface,
> = {
  input: BackgroundApiInterface[K]['input']
  context: BackgroundApiContext
}

export type BackgroundApiResolver<K extends keyof BackgroundApiInterface> = (
  params: BackgroundApiResolverParams<K>
) => Promise<BackgroundApiInterface[K]['output']>
