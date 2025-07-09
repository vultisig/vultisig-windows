export const getCurrentHeight = () =>
  typedFetch<{ count: string }>(`${THORNODE}/lastblock`).then(r => +r.count)
