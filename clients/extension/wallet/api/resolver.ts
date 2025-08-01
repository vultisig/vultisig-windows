import { WalletApiResolverContext } from './context'
import { WalletApiInterface } from './interface'

export type WalletApiMethod<Input, Output> = {
  input: Input
  output: Output
}

export type WalletApiResolverParams<K extends keyof WalletApiInterface> = {
  input: WalletApiInterface[K]['input']
  context: WalletApiResolverContext
}

export type WalletApiResolver<K extends keyof WalletApiInterface> = (
  params: WalletApiResolverParams<K>
) => Promise<WalletApiInterface[K]['output']>
