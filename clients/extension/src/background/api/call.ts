import { BackgroundApiInterface, BackgroundApiMethodName } from './interface'

type CallBackgroundApiInput<M extends BackgroundApiMethodName> = {
  method: M
  input: BackgroundApiInterface[M]['input']
}

export const callBackgroundApi = async <M extends BackgroundApiMethodName>({
  method,
  input,
}: CallBackgroundApiInput<M>): Promise<BackgroundApiInterface[M]['output']> => {
  return
}
