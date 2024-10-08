import { useCurrentKeysignPayload } from './state/currentKeysignPayload';

export const StartKeysignPage = () => {
  const payload = useCurrentKeysignPayload();
  return <code>{JSON.stringify(payload.toJson())}</code>;
};
