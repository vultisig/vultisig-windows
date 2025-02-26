export const getItemRegistry = () => {
  const registry = new Map<string, HTMLElement>()

  function register({
    itemId,
    element,
  }: {
    itemId: string
    element: HTMLElement
  }) {
    registry.set(itemId, element)

    return function unregister() {
      registry.delete(itemId)
    }
  }

  function getElement(itemId: string) {
    return registry.get(itemId) || null
  }

  return { register, getElement }
}
