export const typedFetch = async <T>(url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${url} – ${res.statusText}`)
  return (await res.json()) as T
}
