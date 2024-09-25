import { parseUrlSearchString } from './parseUrlSearchString';

export function getQueryParams<T extends Record<string, string>>(
  url: string
): T {
  return parseUrlSearchString(new URL(url).search);
}
