import { Post } from '../../../wailsjs/go/utils/GoHttp';
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg';

type CallRpcParams = {
  url: string;
  method: string;
  params: any[];
};

type JsonRpcResponse<T> = {
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
};

export const callRpc = async <T>({
  url,
  method,
  params,
}: CallRpcParams): Promise<T> => {
  const payload = {
    jsonrpc: '2.0',
    method: method,
    params: params,
    id: 1,
  };

  const { result, error } = (await Post(url, payload)) as JsonRpcResponse<T>;
  if (result) {
    return result;
  }

  throw new Error(extractErrorMsg(error));
};
